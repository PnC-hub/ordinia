import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/consultant/[clientId]/attendance/export
 *
 * Exports attendance data in CSV or Excel format
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
      include: {
        tenant: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!access) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Parse query params
    const searchParams = req.nextUrl.searchParams
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)
    const format = searchParams.get('format') || 'csv'
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
        jobTitle: true,
        ccnlLevel: true,
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
    })

    // Aggregate data per employee
    const attendanceData = employees.map((emp) => {
      const empEntries = timeEntries.filter((e) => e.employeeId === emp.id)
      const empLeaves = leaveRequests.filter((l) => l.employeeId === emp.id)

      const daysWorked = empEntries.filter((e) => e.clockIn && e.clockOut).length
      const totalMinutes = empEntries.reduce((sum, e) => sum + (e.workedMinutes || 0), 0)
      const overtimeMinutes = empEntries.reduce(
        (sum, e) => sum + (e.overtimeMinutes || 0),
        0
      )

      const sickDays = empLeaves
        .filter((l) => l.type === 'SICK')
        .reduce((sum, l) => sum + Number(l.totalDays), 0)
      const vacationDays = empLeaves
        .filter((l) => l.type === 'VACATION')
        .reduce((sum, l) => sum + Number(l.totalDays), 0)
      const otherLeaveDays = empLeaves
        .filter((l) => !['SICK', 'VACATION'].includes(l.type))
        .reduce((sum, l) => sum + Number(l.totalDays), 0)

      return {
        cognome: emp.lastName,
        nome: emp.firstName,
        codiceFiscale: emp.fiscalCode || '',
        reparto: emp.department || '',
        mansione: emp.jobTitle || '',
        livelloCCNL: emp.ccnlLevel || '',
        giorniLavorati: daysWorked,
        oreTotali: Math.round(totalMinutes / 60 * 100) / 100,
        oreStraordinari: Math.round(overtimeMinutes / 60 * 100) / 100,
        giorniMalattia: sickDays,
        giorniFerie: vacationDays,
        altreAssenze: otherLeaveDays,
      }
    })

    // Generate CSV
    if (format === 'csv') {
      const headers = [
        'Cognome',
        'Nome',
        'Codice Fiscale',
        'Reparto',
        'Mansione',
        'Livello CCNL',
        'Giorni Lavorati',
        'Ore Totali',
        'Ore Straordinari',
        'Giorni Malattia',
        'Giorni Ferie',
        'Altre Assenze',
      ]

      const rows = attendanceData.map((row) => [
        row.cognome,
        row.nome,
        row.codiceFiscale,
        row.reparto,
        row.mansione,
        row.livelloCCNL,
        row.giorniLavorati,
        row.oreTotali.toFixed(2),
        row.oreStraordinari.toFixed(2),
        row.giorniMalattia,
        row.giorniFerie,
        row.altreAssenze,
      ])

      const csv = [
        headers.join(';'),
        ...rows.map((row) => row.join(';')),
      ].join('\n')

      // Add UTF-8 BOM for Excel compatibility
      const bom = '\uFEFF'
      const csvWithBom = bom + csv

      return new NextResponse(csvWithBom, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="presenze_${access.tenant.name}_${month}.csv"`,
        },
      })
    }

    // For Excel format, we'd use a library like xlsx
    // For now, return CSV as fallback
    return NextResponse.json(
      { error: 'Excel export not yet implemented' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error exporting attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
