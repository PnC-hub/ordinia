import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { logAudit } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const invite = await prisma.employeeInvite.findUnique({
      where: { token },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invito non trovato' }, { status: 404 })
    }

    if (invite.acceptedAt) {
      return NextResponse.json(
        { error: 'Questo invito è già stato utilizzato' },
        { status: 400 }
      )
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Questo invito è scaduto' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      employee: invite.employee,
      tenant: invite.tenant,
      email: invite.email,
    })
  } catch (error) {
    console.error('Error fetching invite:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { password, confirmPassword, phone } = body

    // Validate passwords
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'La password deve essere di almeno 8 caratteri' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Le password non coincidono' },
        { status: 400 }
      )
    }

    // Get invite
    const invite = await prisma.employeeInvite.findUnique({
      where: { token },
      include: {
        employee: true,
        tenant: true,
      },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invito non trovato' }, { status: 404 })
    }

    if (invite.acceptedAt) {
      return NextResponse.json(
        { error: 'Questo invito è già stato utilizzato' },
        { status: 400 }
      )
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Questo invito è scaduto' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Esiste già un account con questa email' },
        { status: 400 }
      )
    }

    if (!invite.employee || !invite.employeeId) {
      return NextResponse.json(
        { error: 'Invito non valido: dipendente non trovato' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and link to employee in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: invite.email,
          password: hashedPassword,
          name: `${invite.employee!.firstName} ${invite.employee!.lastName}`,
          role: 'USER',
          phone,
        },
      })

      // Link user to employee
      await tx.employee.update({
        where: { id: invite.employeeId! },
        data: {
          userId: user.id,
          status: 'ACTIVE',
        },
      })

      // Mark invite as accepted
      await tx.employeeInvite.update({
        where: { id: invite.id },
        data: {
          acceptedAt: new Date(),
        },
      })

      return user
    })

    // Log audit
    await logAudit({
      tenantId: invite.tenantId,
      userId: result.id,
      action: 'CREATE',
      entityType: 'User',
      entityId: result.id,
      newValue: {
        email: result.email,
        role: 'USER',
        employeeId: invite.employeeId,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Account creato con successo',
      email: result.email,
    })
  } catch (error) {
    console.error('Error accepting invite:', error)
    return NextResponse.json({ error: 'Errore nella creazione dell\'account' }, { status: 500 })
  }
}
