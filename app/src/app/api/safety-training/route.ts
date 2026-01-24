import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// GET /api/safety-training - Get all safety trainings for tenant
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

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

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: {
      tenantId: string
      employeeId?: string
      status?: string
      trainingType?: string
    } = {
      tenantId: membership.tenantId,
    }

    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status
    if (type) where.trainingType = type

    const trainings = await prisma.safetyTraining.findMany({
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
      orderBy: [{ expiresAt: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(trainings)
  } catch (error) {
    console.error('Error fetching safety trainings:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero formazioni sicurezza' },
      { status: 500 }
    )
  }
}

// POST /api/safety-training - Create new safety training
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

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

    const body = await req.json()
    const {
      employeeId,
      trainingType,
      title,
      description,
      hoursRequired,
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

    // Validate required fields
    if (!employeeId || !trainingType || !title || !hoursRequired) {
      return NextResponse.json(
        { error: 'Dipendente, tipo formazione, titolo e ore richieste sono obbligatori' },
        { status: 400 }
      )
    }

    // Verify employee belongs to tenant
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId: membership.tenantId,
      },
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Dipendente non trovato' },
        { status: 404 }
      )
    }

    const training = await prisma.safetyTraining.create({
      data: {
        tenantId: membership.tenantId,
        employeeId,
        trainingType,
        title,
        description: description || null,
        hoursRequired: parseInt(hoursRequired),
        hoursCompleted: hoursCompleted ? parseInt(hoursCompleted) : 0,
        provider: provider || null,
        instructor: instructor || null,
        location: location || null,
        startedAt: startedAt ? new Date(startedAt) : null,
        completedAt: completedAt ? new Date(completedAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        certificateNumber: certificateNumber || null,
        certificatePath: certificatePath || null,
        status: status || 'NOT_STARTED',
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

    // Create deadline for expiry if set
    if (expiresAt) {
      await prisma.deadline.create({
        data: {
          tenantId: membership.tenantId,
          employeeId,
          title: `Scadenza formazione: ${title}`,
          type: 'TRAINING_EXPIRY',
          dueDate: new Date(expiresAt),
          notify30Days: true,
          notify60Days: true,
        },
      })
    }

    // Log audit
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'CREATE',
      entityType: 'SafetyTraining',
      entityId: training.id,
      newValue: {
        trainingType,
        title,
        employeeId,
        hoursRequired,
      },
    })

    return NextResponse.json(training, { status: 201 })
  } catch (error) {
    console.error('Error creating safety training:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione formazione sicurezza' },
      { status: 500 }
    )
  }
}
