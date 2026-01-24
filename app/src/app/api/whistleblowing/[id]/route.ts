import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// GET /api/whistleblowing/[id] - Get specific report
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

    // Only OWNER and ADMIN can view whistleblowing reports
    if (!['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi per visualizzare le segnalazioni' },
        { status: 403 }
      )
    }

    const report = await prisma.whistleblowingReport.findFirst({
      where: {
        id,
        tenantId: membership.tenantId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Segnalazione non trovata' },
        { status: 404 }
      )
    }

    // Mask reporter info for anonymous reports (only show to manager if CONFIDENTIAL)
    const maskedReport = {
      ...report,
      reporterName: report.reporterType === 'ANONYMOUS' ? null : report.reporterName,
      reporterEmail: report.reporterType === 'ANONYMOUS' ? null : report.reporterEmail,
      reporterPhone: report.reporterType === 'ANONYMOUS' ? null : report.reporterPhone,
    }

    return NextResponse.json(maskedReport)
  } catch (error) {
    console.error('Error fetching whistleblowing report:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero segnalazione' },
      { status: 500 }
    )
  }
}

// PUT /api/whistleblowing/[id] - Update report status
export async function PUT(
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

    // Only OWNER and ADMIN can update whistleblowing reports
    if (!['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi per gestire le segnalazioni' },
        { status: 403 }
      )
    }

    const existingReport = await prisma.whistleblowingReport.findFirst({
      where: {
        id,
        tenantId: membership.tenantId,
      },
    })

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Segnalazione non trovata' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const updateData: Record<string, unknown> = {}

    // Status updates with timestamps
    if (body.status) {
      updateData.status = body.status

      // Auto-set timestamps based on status
      const now = new Date()
      switch (body.status) {
        case 'ACKNOWLEDGED':
          if (!existingReport.acknowledgedAt) {
            updateData.acknowledgedAt = now
          }
          break
        case 'UNDER_INVESTIGATION':
          if (!existingReport.investigationStartedAt) {
            updateData.investigationStartedAt = now
          }
          break
        case 'SUBSTANTIATED':
        case 'UNSUBSTANTIATED':
          if (!existingReport.investigationCompletedAt) {
            updateData.investigationCompletedAt = now
          }
          break
        case 'CLOSED':
          updateData.closedAt = now
          break
      }
    }

    // Assignment
    if (body.assignedTo !== undefined) {
      updateData.assignedTo = body.assignedTo
    }

    // Outcome
    if (body.outcome !== undefined) {
      updateData.outcome = body.outcome
    }
    if (body.actionsTaken !== undefined) {
      updateData.actionsTaken = body.actionsTaken
    }

    // Feedback tracking
    if (body.lastFeedbackAt !== undefined) {
      updateData.lastFeedbackAt = body.lastFeedbackAt ? new Date(body.lastFeedbackAt) : null
    }

    const report = await prisma.whistleblowingReport.update({
      where: { id },
      data: updateData,
    })

    // Log audit
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'UPDATE',
      entityType: 'WhistleblowingReport',
      entityId: report.id,
      oldValue: { status: existingReport.status },
      newValue: { status: report.status },
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error updating whistleblowing report:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento segnalazione' },
      { status: 500 }
    )
  }
}
