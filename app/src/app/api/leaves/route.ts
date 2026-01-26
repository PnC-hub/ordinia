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
    const year = searchParams.get('year')

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

    // If employee, only show their own leaves
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

    if (year) {
      const yearNum = parseInt(year)
      where.startDate = {
        gte: new Date(yearNum, 0, 1),
        lt: new Date(yearNum + 1, 0, 1),
      }
    }

    const leaves = await prisma.leaveRequest.findMany({
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
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(leaves)
  } catch (error) {
    console.error('Error fetching leaves:', error)
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
    const { type, startDate, endDate, startHalf, endHalf, reason } = body

    // Validate required fields
    if (!type || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Tipo, data inizio e data fine sono obbligatori' },
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

    // Parse dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Validate dates
    if (start > end) {
      return NextResponse.json(
        { error: 'La data di inizio deve essere precedente alla data di fine' },
        { status: 400 }
      )
    }

    // Calculate days
    let totalDays = 0
    const currentDate = new Date(start)
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay()
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalDays += 1
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Adjust for half days
    if (startHalf) {
      totalDays -= 0.5
    }
    if (endHalf) {
      totalDays -= 0.5
    }

    // Check if there are overlapping requests
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            AND: [{ startDate: { lte: end } }, { endDate: { gte: start } }],
          },
        ],
      },
    })

    if (overlapping) {
      return NextResponse.json(
        { error: 'Esiste già una richiesta per questo periodo' },
        { status: 400 }
      )
    }

    // Create leave request
    const leave = await prisma.leaveRequest.create({
      data: {
        tenantId,
        employeeId,
        type,
        startDate: start,
        endDate: end,
        totalDays,
        startHalf: startHalf || false,
        endHalf: endHalf || false,
        reason,
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
      entityType: 'LeaveRequest',
      entityId: leave.id,
      newValue: {
        type,
        startDate: start,
        endDate: end,
        totalDays,
      },
    })

    // Create notification for managers
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
          type: 'LEAVE_REQUESTED',
          title: 'Nuova richiesta di permesso',
          message: `${leave.employee.firstName} ${leave.employee.lastName} ha richiesto ${totalDays} giorni di ${type}`,
          entityType: 'LeaveRequest',
          entityId: leave.id,
        },
      })
    }

    return NextResponse.json(leave, { status: 201 })
  } catch (error) {
    console.error('Error creating leave request:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
