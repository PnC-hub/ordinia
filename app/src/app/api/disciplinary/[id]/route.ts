import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// GET /api/disciplinary/[id] - Get specific procedure
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

    // Only OWNER, ADMIN, HR_MANAGER can view disciplinary procedures
    if (!['OWNER', 'ADMIN', 'HR_MANAGER'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi per questa operazione' },
        { status: 403 }
      )
    }

    const procedure = await prisma.disciplinaryProcedure.findFirst({
      where: {
        id,
        tenantId: membership.tenantId,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            jobTitle: true,
            fiscalCode: true,
            email: true,
            hireDate: true,
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!procedure) {
      return NextResponse.json(
        { error: 'Procedura non trovata' },
        { status: 404 }
      )
    }

    return NextResponse.json(procedure)
  } catch (error) {
    console.error('Error fetching disciplinary procedure:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero procedura disciplinare' },
      { status: 500 }
    )
  }
}

// PUT /api/disciplinary/[id] - Update procedure
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

    // Only OWNER, ADMIN, HR_MANAGER can update disciplinary procedures
    if (!['OWNER', 'ADMIN', 'HR_MANAGER'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi per questa operazione' },
        { status: 403 }
      )
    }

    const existingProcedure = await prisma.disciplinaryProcedure.findFirst({
      where: {
        id,
        tenantId: membership.tenantId,
      },
    })

    if (!existingProcedure) {
      return NextResponse.json(
        { error: 'Procedura non trovata' },
        { status: 404 }
      )
    }

    const body = await req.json()

    // Build update data based on what's provided
    const updateData: Record<string, unknown> = {}

    // Contestation phase
    if (body.contestationDate !== undefined) {
      updateData.contestationDate = body.contestationDate ? new Date(body.contestationDate) : null
    }
    if (body.contestationText !== undefined) updateData.contestationText = body.contestationText
    if (body.contestationDeliveryMethod !== undefined) {
      updateData.contestationDeliveryMethod = body.contestationDeliveryMethod
    }
    if (body.contestationDeliveredAt !== undefined) {
      updateData.contestationDeliveredAt = body.contestationDeliveredAt
        ? new Date(body.contestationDeliveredAt)
        : null
      // Auto-calculate defense deadline (5 days per Art. 7 comma 5)
      if (body.contestationDeliveredAt) {
        const deliveredDate = new Date(body.contestationDeliveredAt)
        const defenseDeadline = new Date(deliveredDate)
        defenseDeadline.setDate(defenseDeadline.getDate() + 5)
        updateData.defenseDeadline = defenseDeadline
      }
    }

    // Defense phase
    if (body.defenseReceivedAt !== undefined) {
      updateData.defenseReceivedAt = body.defenseReceivedAt ? new Date(body.defenseReceivedAt) : null
    }
    if (body.defenseText !== undefined) updateData.defenseText = body.defenseText
    if (body.defenseRequestedHearing !== undefined) {
      updateData.defenseRequestedHearing = body.defenseRequestedHearing
    }
    if (body.hearingDate !== undefined) {
      updateData.hearingDate = body.hearingDate ? new Date(body.hearingDate) : null
    }
    if (body.hearingNotes !== undefined) updateData.hearingNotes = body.hearingNotes

    // Decision phase
    if (body.decisionDate !== undefined) {
      updateData.decisionDate = body.decisionDate ? new Date(body.decisionDate) : null
    }
    if (body.sanctionType !== undefined) updateData.sanctionType = body.sanctionType
    if (body.sanctionDetails !== undefined) updateData.sanctionDetails = body.sanctionDetails
    if (body.sanctionDeliveredAt !== undefined) {
      updateData.sanctionDeliveredAt = body.sanctionDeliveredAt
        ? new Date(body.sanctionDeliveredAt)
        : null
    }

    // Appeal
    if (body.appealedAt !== undefined) {
      updateData.appealedAt = body.appealedAt ? new Date(body.appealedAt) : null
    }
    if (body.appealOutcome !== undefined) updateData.appealOutcome = body.appealOutcome

    // Status
    if (body.status !== undefined) updateData.status = body.status

    // Description (can be updated in draft)
    if (body.infractionDescription !== undefined) {
      updateData.infractionDescription = body.infractionDescription
    }

    const procedure = await prisma.disciplinaryProcedure.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        documents: true,
      },
    })

    // Log audit
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'UPDATE',
      entityType: 'DisciplinaryProcedure',
      entityId: procedure.id,
      oldValue: { status: existingProcedure.status },
      newValue: { status: procedure.status },
    })

    return NextResponse.json(procedure)
  } catch (error) {
    console.error('Error updating disciplinary procedure:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento procedura disciplinare' },
      { status: 500 }
    )
  }
}

// DELETE /api/disciplinary/[id] - Delete procedure (only if DRAFT)
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

    // Only OWNER, ADMIN can delete disciplinary procedures
    if (!['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi per questa operazione' },
        { status: 403 }
      )
    }

    const procedure = await prisma.disciplinaryProcedure.findFirst({
      where: {
        id,
        tenantId: membership.tenantId,
      },
    })

    if (!procedure) {
      return NextResponse.json(
        { error: 'Procedura non trovata' },
        { status: 404 }
      )
    }

    // Only DRAFT procedures can be deleted
    if (procedure.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Solo le procedure in bozza possono essere eliminate' },
        { status: 400 }
      )
    }

    await prisma.disciplinaryProcedure.delete({
      where: { id },
    })

    // Log audit
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'DELETE',
      entityType: 'DisciplinaryProcedure',
      entityId: id,
      oldValue: {
        employeeId: procedure.employeeId,
        infractionType: procedure.infractionType,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting disciplinary procedure:', error)
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione procedura disciplinare' },
      { status: 500 }
    )
  }
}
