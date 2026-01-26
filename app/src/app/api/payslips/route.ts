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
    const period = searchParams.get('period') // formato YYYY-MM

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

    // If employee, only show their own payslips
    if (user.employee && !user.tenantId) {
      where.employeeId = user.employee.id
    } else if (employeeId) {
      where.employeeId = employeeId
    }

    if (period) {
      where.period = period
    }

    const payslips = await prisma.payslip.findMany({
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
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { period: 'desc' },
    })

    return NextResponse.json(payslips)
  } catch (error) {
    console.error('Error fetching payslips:', error)
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
      employeeId,
      period,
      grossAmount,
      netAmount,
      fileName,
      fileUrl,
      fileSize,
    } = body

    // Validate required fields
    if (!employeeId || !period || !fileName || !fileUrl) {
      return NextResponse.json(
        { error: 'Dipendente, periodo, nome file e URL sono obbligatori' },
        { status: 400 }
      )
    }

    // Validate period format
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return NextResponse.json(
        { error: 'Periodo deve essere in formato YYYY-MM' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true },
    })

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Verify employee belongs to tenant
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId: user.tenantId,
      },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Dipendente non trovato' }, { status: 404 })
    }

    // Check if payslip already exists for this period
    const existing = await prisma.payslip.findUnique({
      where: {
        employeeId_period: {
          employeeId,
          period,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Esiste già una busta paga per questo periodo' },
        { status: 400 }
      )
    }

    // Create payslip
    const payslip = await prisma.payslip.create({
      data: {
        tenantId: user.tenantId,
        employeeId,
        period,
        grossAmount: grossAmount || null,
        netAmount: netAmount || null,
        fileName,
        fileUrl,
        fileSize: fileSize || null,
        uploadedBy: user.id,
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
      tenantId: user.tenantId,
      userId: user.id,
      action: 'CREATE',
      entityType: 'Payslip',
      entityId: payslip.id,
      newValue: {
        employeeId,
        period,
        grossAmount,
        netAmount,
      },
    })

    // Notify employee
    if (employee.userId) {
      const [year, month] = period.split('-')
      const monthNames = [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
      ]

      await prisma.notification.create({
        data: {
          tenantId: user.tenantId,
          userId: employee.userId,
          type: 'PAYSLIP_AVAILABLE',
          title: 'Nuova busta paga disponibile',
          message: `La busta paga di ${monthNames[parseInt(month) - 1]} ${year} è disponibile`,
          entityType: 'Payslip',
          entityId: payslip.id,
        },
      })
    }

    return NextResponse.json(payslip, { status: 201 })
  } catch (error) {
    console.error('Error creating payslip:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
