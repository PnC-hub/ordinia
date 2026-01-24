import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// GET /api/safety-training/[id] - Get specific training
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

    const training = await prisma.safetyTraining.findFirst({
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
          },
        },
      },
    })

    if (!training) {
      return NextResponse.json(
        { error: 'Formazione non trovata' },
        { status: 404 }
      )
    }

    return NextResponse.json(training)
  } catch (error) {
    console.error('Error fetching safety training:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero formazione sicurezza' },
      { status: 500 }
    )
  }
}

// PUT /api/safety-training/[id] - Update training
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
        { error: 'Non hai i permessi per questa operazione' },
        { status: 403 }
      )
    }

    const existingTraining = await prisma.safetyTraining.findFirst({
      where: {
        id,
        tenantId: membership.tenantId,
      },
    })

    if (!existingTraining) {
      return NextResponse.json(
        { error: 'Formazione non trovata' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const {
      title,
      description,
      hoursCompleted,
      provider,
      instructor,
      location,
      startedAt,
      completedAt,
      expiresAt,
      certificateNumber,
      certificatePath,
      status,
    } = body

    const training = await prisma.safetyTraining.update({
      where: { id },
      data: {
        title: title || existingTraining.title,
        description: description ?? existingTraining.description,
        hoursCompleted: hoursCompleted !== undefined
          ? parseInt(hoursCompleted)
          : existingTraining.hoursCompleted,
        provider: provider ?? existingTraining.provider,
        instructor: instructor ?? existingTraining.instructor,
        location: location ?? existingTraining.location,
        startedAt: startedAt ? new Date(startedAt) : existingTraining.startedAt,
        completedAt: completedAt ? new Date(completedAt) : existingTraining.completedAt,
        expiresAt: expiresAt ? new Date(expiresAt) : existingTraining.expiresAt,
        certificateNumber: certificateNumber ?? existingTraining.certificateNumber,
        certificatePath: certificatePath ?? existingTraining.certificatePath,
        status: status || existingTraining.status,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Log audit
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'UPDATE',
      entityType: 'SafetyTraining',
      entityId: training.id,
      oldValue: {
        status: existingTraining.status,
        hoursCompleted: existingTraining.hoursCompleted,
      },
      newValue: {
        status: training.status,
        hoursCompleted: training.hoursCompleted,
      },
    })

    return NextResponse.json(training)
  } catch (error) {
    console.error('Error updating safety training:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento formazione sicurezza' },
      { status: 500 }
    )
  }
}

// DELETE /api/safety-training/[id] - Delete training
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

    // Check role
    if (!['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi per questa operazione' },
        { status: 403 }
      )
    }

    const training = await prisma.safetyTraining.findFirst({
      where: {
        id,
        tenantId: membership.tenantId,
      },
    })

    if (!training) {
      return NextResponse.json(
        { error: 'Formazione non trovata' },
        { status: 404 }
      )
    }

    await prisma.safetyTraining.delete({
      where: { id },
    })

    // Log audit
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'DELETE',
      entityType: 'SafetyTraining',
      entityId: id,
      oldValue: {
        trainingType: training.trainingType,
        title: training.title,
        employeeId: training.employeeId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting safety training:', error)
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione formazione sicurezza' },
      { status: 500 }
    )
  }
}
