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
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const status = searchParams.get('status')

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

    // If employee, only show their own entries
    if (user.employee && !user.tenantId) {
      where.employeeId = user.employee.id
    } else if (employeeId) {
      where.employeeId = employeeId
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

    if (status) {
      where.status = status
    }

    const entries = await prisma.timeEntry.findMany({
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
      },
      orderBy: [{ date: 'desc' }, { clockIn: 'desc' }],
      take: 500,
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching attendance:', error)
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
    const { action, latitude, longitude, locationName, notes } = body

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
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Get IP and user agent
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    if (action === 'clock-in') {
      // Check if there's already an open entry today
      const existingEntry = await prisma.timeEntry.findFirst({
        where: {
          employeeId,
          date: today,
          clockOut: null,
        },
      })

      if (existingEntry) {
        return NextResponse.json(
          { error: 'Hai già una timbratura in corso. Effettua prima l\'uscita.' },
          { status: 400 }
        )
      }

      // Validate geolocation is provided
      if (!latitude || !longitude) {
        return NextResponse.json(
          { error: 'La geolocalizzazione è obbligatoria per la timbratura' },
          { status: 400 }
        )
      }

      // Create clock-in entry
      const entry = await prisma.timeEntry.create({
        data: {
          tenantId,
          employeeId,
          date: today,
          clockIn: now,
          clockInLat: latitude,
          clockInLng: longitude,
          clockInAddress: locationName,
          clockInIp: ipAddress,
          clockInUserAgent: userAgent,
          status: 'PENDING',
          notes,
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
          action: 'clock-in',
          clockIn: now,
          latitude,
          longitude,
        },
      })

      return NextResponse.json(entry, { status: 201 })
    } else if (action === 'clock-out') {
      // Find open entry for today
      const openEntry = await prisma.timeEntry.findFirst({
        where: {
          employeeId,
          date: today,
          clockOut: null,
        },
      })

      if (!openEntry) {
        return NextResponse.json(
          { error: 'Nessuna timbratura in corso trovata' },
          { status: 400 }
        )
      }

      // Validate geolocation
      if (!latitude || !longitude) {
        return NextResponse.json(
          { error: 'La geolocalizzazione è obbligatoria per la timbratura' },
          { status: 400 }
        )
      }

      // Calculate total hours
      const clockInTime = new Date(openEntry.clockIn!).getTime()
      const clockOutTime = now.getTime()
      const totalMinutes = Math.round((clockOutTime - clockInTime) / (1000 * 60))

      // Calculate break time (if configured)
      let breakMinutes = 0
      if (totalMinutes >= 360) {
        // Auto-add 30 min break for shifts > 6 hours (configurable per tenant)
        breakMinutes = 30
      }

      const workedMinutes = totalMinutes - breakMinutes

      // Update entry
      const entry = await prisma.timeEntry.update({
        where: { id: openEntry.id },
        data: {
          clockOut: now,
          clockOutLat: latitude,
          clockOutLng: longitude,
          clockOutAddress: locationName,
          clockOutIp: ipAddress,
          clockOutUserAgent: userAgent,
          breakMinutes,
          workedMinutes,
          notes: notes || openEntry.notes,
        },
      })

      // Log audit
      await logAudit({
        tenantId,
        userId: user.id,
        action: 'UPDATE',
        entityType: 'TimeEntry',
        entityId: entry.id,
        oldValue: { clockOut: null },
        newValue: {
          action: 'clock-out',
          clockOut: now,
          latitude,
          longitude,
          workedMinutes,
        },
      })

      return NextResponse.json(entry)
    } else {
      return NextResponse.json({ error: 'Azione non valida' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing attendance:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
