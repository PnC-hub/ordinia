import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true, employee: true },
    })

    if (!user?.tenantId && !user?.employee?.tenantId) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 404 })
    }

    const tenantId = (user.tenantId || user.employee?.tenantId) as string

    const body = await request.json()
    const { employeeId, date, clockIn, clockOut, breakMinutes, notes } = body

    if (!employeeId || !date || !clockIn) {
      return NextResponse.json(
        { error: 'Dipendente, data ed orario di entrata sono obbligatori' },
        { status: 400 }
      )
    }

    // Verify employee belongs to this tenant
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId,
      },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Dipendente non trovato' }, { status: 404 })
    }

    // Check for existing entry on this date
    const existingEntry = await prisma.timeEntry.findFirst({
      where: {
        employeeId,
        date: new Date(date),
      },
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Esiste già una timbratura per questa data. Elimina prima quella esistente.' },
        { status: 400 }
      )
    }

    // Parse date and times
    const entryDate = new Date(date)
    const clockInDateTime = new Date(`${date}T${clockIn}:00`)
    const clockOutDateTime = clockOut ? new Date(`${date}T${clockOut}:00`) : null

    // Calculate worked minutes
    let workedMinutes = 0
    if (clockOutDateTime) {
      const totalMinutes = Math.round(
        (clockOutDateTime.getTime() - clockInDateTime.getTime()) / (1000 * 60)
      )
      workedMinutes = totalMinutes - (breakMinutes || 0)
    }

    // Calculate overtime (over 8 hours per day = 480 minutes)
    const overtimeMinutes = workedMinutes > 480 ? workedMinutes - 480 : 0

    // Create manual entry
    const entry = await prisma.timeEntry.create({
      data: {
        tenantId,
        employeeId,
        date: entryDate,
        clockIn: clockInDateTime,
        clockOut: clockOutDateTime,
        breakMinutes: breakMinutes || 0,
        workedMinutes,
        overtimeMinutes,
        status: 'PENDING',
        notes: notes || 'Timbratura manuale',
        managerNotes: `Inserita manualmente da ${user.name || user.email}`,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            jobTitle: true,
          },
        },
      },
    })

    // Log audit
    await logAudit({
      tenantId,
      userId: user.id,
      action: 'CREATE',
      entityType: 'TimeEntry',
      entityId: entry.id,
      newValue: {
        type: 'manual_entry',
        employeeId,
        date,
        clockIn,
        clockOut,
        workedMinutes,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating manual attendance entry:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
