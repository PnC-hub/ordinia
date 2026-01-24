import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// GET /api/whistleblowing/[id]/messages - Get messages for a report
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const membership = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Nessun tenant associato' },
        { status: 403 }
      )
    }

    // Only OWNER and ADMIN can view messages
    if (!['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi' },
        { status: 403 }
      )
    }

    const report = await prisma.whistleblowingReport.findFirst({
      where: {
        id,
        tenantId: membership.tenantId,
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Segnalazione non trovata' },
        { status: 404 }
      )
    }

    const messages = await prisma.whistleblowingMessage.findMany({
      where: { reportId: id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching whistleblowing messages:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero messaggi' },
      { status: 500 }
    )
  }
}

// POST /api/whistleblowing/[id]/messages - Add message (manager)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const membership = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Nessun tenant associato' },
        { status: 403 }
      )
    }

    // Only OWNER and ADMIN can send messages
    if (!['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi' },
        { status: 403 }
      )
    }

    const report = await prisma.whistleblowingReport.findFirst({
      where: {
        id,
        tenantId: membership.tenantId,
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Segnalazione non trovata' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Contenuto messaggio obbligatorio' },
        { status: 400 }
      )
    }

    const message = await prisma.whistleblowingMessage.create({
      data: {
        reportId: id,
        senderType: 'manager',
        content,
      },
    })

    // Update last feedback date (per D.Lgs. 24/2023 obbligo feedback entro 3 mesi)
    await prisma.whistleblowingReport.update({
      where: { id },
      data: { lastFeedbackAt: new Date() },
    })

    // Log audit
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'CREATE',
      entityType: 'WhistleblowingMessage',
      entityId: message.id,
      newValue: { reportId: id, senderType: 'manager' },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating whistleblowing message:', error)
    return NextResponse.json(
      { error: 'Errore nell\'invio messaggio' },
      { status: 500 }
    )
  }
}
