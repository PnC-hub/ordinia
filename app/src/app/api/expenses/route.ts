import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Get user and tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true, employee: true },
    })

    if (!user?.tenantId && !user?.employee?.tenantId) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 404 })
    }

    const tenantId = user.tenantId || user.employee?.tenantId

    const where: Record<string, unknown> = {
      tenantId,
    }

    // If employee, only show their own expenses
    if (user.employee && !user.tenantId) {
      where.employeeId = user.employee.id
    } else if (employeeId) {
      where.employeeId = employeeId
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) {
        (where.date as Record<string, Date>).gte = new Date(dateFrom)
      }
      if (dateTo) {
        (where.date as Record<string, Date>).lte = new Date(dateTo)
      }
    }

    const expenses = await prisma.expenseRequest.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
        receipts: true,
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      description,
      date,
      amount,
      currency,
      // Mileage specific
      origin,
      destination,
      kilometers,
      vehicleType,
      vehiclePlate,
      // Travel specific
      tripPurpose,
      clientName,
      notes,
    } = body

    // Validate required fields
    if (!type || !description || !date || !amount) {
      return NextResponse.json(
        { error: 'Tipo, descrizione, data e importo sono obbligatori' },
        { status: 400 }
      )
    }

    // Get user's employee record
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    })

    if (!user?.employee) {
      return NextResponse.json({ error: 'Profilo dipendente non trovato' }, { status: 404 })
    }

    const tenantId = user.employee.tenantId
    const employeeId = user.employee.id

    let finalAmount = parseFloat(amount)

    // Calculate mileage reimbursement if applicable
    if (type === 'MILEAGE' && kilometers) {
      // Default ACI rate for vehicles
      const defaultRates: Record<string, number> = {
        CAR: 0.42,
        MOTORCYCLE: 0.25,
        MOPED: 0.18,
      }
      const ratePerKm = defaultRates[vehicleType || 'CAR'] || 0.42
      finalAmount = parseFloat(kilometers) * ratePerKm
    }

    if (finalAmount <= 0) {
      return NextResponse.json(
        { error: 'L\'importo deve essere maggiore di zero' },
        { status: 400 }
      )
    }

    // Create expense request
    const expense = await prisma.expenseRequest.create({
      data: {
        tenantId,
        employeeId,
        type,
        description,
        date: new Date(date),
        amount: finalAmount,
        currency: currency || 'EUR',
        origin,
        destination,
        kilometers: kilometers ? parseFloat(kilometers) : null,
        ratePerKm: type === 'MILEAGE' ? 0.42 : null,
        vehicleType,
        vehiclePlate,
        tripPurpose,
        clientName,
        status: 'PENDING',
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Log audit
    await logAudit({
      tenantId,
      userId: user.id,
      action: 'CREATE',
      entityType: 'ExpenseRequest',
      entityId: expense.id,
      newValue: {
        type,
        description,
        amount: finalAmount,
        date,
      },
    })

    // Create notification for manager
    const managers = await prisma.user.findMany({
      where: {
        tenantId,
        role: { in: ['ADMIN', 'HR_MANAGER'] },
      },
      select: { id: true },
    })

    for (const manager of managers) {
      await prisma.notification.create({
        data: {
          tenantId,
          userId: manager.id,
          type: 'EXPENSE_REQUESTED',
          title: 'Nuova nota spese',
          message: `${expense.employee.firstName} ${expense.employee.lastName} ha inserito una nota spese di €${finalAmount.toFixed(2)}`,
          entityType: 'ExpenseRequest',
          entityId: expense.id,
        },
      })
    }

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
