import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/consultant/[clientId]/attendance/preview
 *
 * Returns attendance data preview for export
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clientId } = await params

    // Verify consultant has access to this client
    const access = await prisma.consultantClient.findFirst({
      where: {
        consultantId: session.user.id,
        tenantId: clientId,
        isActive: true,
      },
    })

    if (!access) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Parse query params
    const searchParams = req.nextUrl.searchParams
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)
    const customRange = searchParams.get('customRange') === 'true'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    let dateStart: Date
    let dateEnd: Date

    if (customRange && startDate && endDate) {
      dateStart = new Date(startDate)
      dateEnd = new Date(endDate)
    } else {
      const [year, monthNum] = month.split('-').map(Number)
      dateStart = new Date(year, monthNum - 1, 1)
      dateEnd = new Date(year, monthNum, 0)
    }

    // Get all active employees
    const employees = await prisma.employee.findMany({
      where: {
        tenantId: clientId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fiscalCode: true,
        department: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    })

    // Get attendance data for period
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        tenantId: clientId,
        date: {
          gte: dateStart,
          lte: dateEnd,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
          },
        },
      },
    })

    // Get leave requests for period
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        tenantId: clientId,
        status: { in: ['APPROVED', 'IN_PROGRESS', 'COMPLETED'] },
        startDate: {
          lte: dateEnd,
        },
        endDate: {
          gte: dateStart,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
          },
        },
      },
    })

    // Aggregate data per employee
    const attendanceData = employees.map((emp) => {
      // Filter entries for this employee
      const empEntries = timeEntries.filter((e) => e.employeeId === emp.id)
      const empLeaves = leaveRequests.filter((l) => l.employeeId === emp.id)

      // Calculate metrics
      const daysWorked = empEntries.filter((e) => e.clockIn && e.clockOut).length
      const totalMinutes = empEntries.reduce((sum, e) => sum + (e.workedMinutes || 0), 0)
      const overtimeMinutes = empEntries.reduce(
        (sum, e) => sum + (e.overtimeMinutes || 0),
        0
      )

      // Count leave types
      const sickDays = empLeaves
        .filter((l) => l.type === 'SICK')
        .reduce((sum, l) => sum + Number(l.totalDays), 0)
      const vacationDays = empLeaves
        .filter((l) => l.type === 'VACATION')
        .reduce((sum, l) => sum + Number(l.totalDays), 0)

      const totalAbsences = empLeaves.reduce((sum, l) => sum + Number(l.totalDays), 0)

      return {
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        fiscalCode: emp.fiscalCode || 'N/A',
        department: emp.department || 'N/A',
        daysWorked,
        totalHours: totalMinutes / 60,
        overtimeHours: overtimeMinutes / 60,
        absences: totalAbsences,
        sickDays,
        vacationDays,
      }
    })

    return NextResponse.json(attendanceData)
  } catch (error) {
    console.error('Error fetching attendance preview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
