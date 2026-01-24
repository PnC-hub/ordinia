import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// PUT /api/onboarding-timeline/[id] - Update phase status
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

    // Check role
    if (!['OWNER', 'ADMIN', 'HR_MANAGER'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi' },
        { status: 403 }
      )
    }

    const existingPhase = await prisma.onboardingTimeline.findFirst({
      where: {
        id,
        tenantId: membership.tenantId,
      },
    })

    if (!existingPhase) {
      return NextResponse.json(
        { error: 'Fase non trovata' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const updateData: Record<string, unknown> = {}

    // Status update
    if (body.status) {
      updateData.status = body.status

      // Auto-set timestamps
      if (body.status === 'IN_PROGRESS' && !existingPhase.startedAt) {
        updateData.startedAt = new Date()
      }
      if (body.status === 'COMPLETED' && !existingPhase.completedAt) {
        updateData.completedAt = new Date()
        updateData.completedBy = session.user.id
      }
    }

    // Other fields
    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null
    }
    if (body.assignedTo !== undefined) {
      updateData.assignedTo = body.assignedTo
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }
    if (body.documentId !== undefined) {
      updateData.documentId = body.documentId
    }

    const phase = await prisma.onboardingTimeline.update({
      where: { id },
      data: updateData,
    })

    // Log audit
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'UPDATE',
      entityType: 'OnboardingTimeline',
      entityId: phase.id,
      oldValue: { status: existingPhase.status },
      newValue: { status: phase.status },
    })

    return NextResponse.json(phase)
  } catch (error) {
    console.error('Error updating onboarding phase:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento fase onboarding' },
      { status: 500 }
    )
  }
}

// DELETE /api/onboarding-timeline/[id] - Delete phase
export async function DELETE(
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

    // Only OWNER and ADMIN can delete phases
    if (!['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi' },
        { status: 403 }
      )
    }

    const phase = await prisma.onboardingTimeline.findFirst({
      where: {
        id,
        tenantId: membership.tenantId,
      },
    })

    if (!phase) {
      return NextResponse.json(
        { error: 'Fase non trovata' },
        { status: 404 }
      )
    }

    await prisma.onboardingTimeline.delete({
      where: { id },
    })

    // Log audit
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'DELETE',
      entityType: 'OnboardingTimeline',
      entityId: id,
      oldValue: { phase: phase.phase, employeeId: phase.employeeId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting onboarding phase:', error)
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione fase onboarding' },
      { status: 500 }
    )
  }
}
