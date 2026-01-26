import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Get user's tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true },
    })

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const pending = searchParams.get('pending') === 'true'

    const where: Record<string, unknown> = {
      tenantId: user.tenantId,
    }

    if (pending) {
      where.acceptedAt = null
      where.expiresAt = { gt: new Date() }
    }

    const invites = await prisma.employeeInvite.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(invites)
  } catch (error) {
    console.error('Error fetching invites:', error)
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
    const { employeeId, email, sendEmail } = body

    // Get user's tenant
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

    // Check if employee already has a user account
    if (employee.userId) {
      return NextResponse.json(
        { error: 'Il dipendente ha già un account attivo' },
        { status: 400 }
      )
    }

    const emailToUse = email || employee.email

    if (!emailToUse) {
      return NextResponse.json(
        { error: 'Email obbligatoria per l\'invito' },
        { status: 400 }
      )
    }

    // Check for existing pending invite
    const existingInvite = await prisma.employeeInvite.findFirst({
      where: {
        employeeId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    })

    if (existingInvite) {
      return NextResponse.json(
        { error: 'Esiste già un invito pending per questo dipendente' },
        { status: 400 }
      )
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')

    // Set expiry (7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Create invite
    const invite = await prisma.employeeInvite.create({
      data: {
        tenantId: user.tenantId,
        employeeId,
        email: emailToUse,
        token,
        invitedBy: user.id,
        expiresAt,
      },
      include: {
        employee: {
          select: {
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
      entityType: 'EmployeeInvite',
      entityId: invite.id,
      newValue: {
        employeeId,
        email: emailToUse,
      },
    })

    // Send email if requested
    if (sendEmail !== false) {
      const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`

      // TODO: Implement actual email sending
      console.log(`[EMAIL] Sending invite to ${emailToUse}`)
      console.log(`[EMAIL] Invite URL: ${inviteUrl}`)
    }

    return NextResponse.json({
      ...invite,
      inviteUrl: `${process.env.NEXTAUTH_URL}/invite/${token}`,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
