import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SafetyTrainingStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const membership = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id },
      include: { tenant: true }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')

    const where: any = {
      tenantId: membership.tenantId
    }

    if (employeeId) {
      where.employeeId = employeeId
    }

    if (status) {
      where.status = status
    }

    const trainings = await prisma.safetyTraining.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            jobTitle: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { expiresAt: 'asc' }
      ]
    })

    return NextResponse.json(trainings)
  } catch (error) {
    console.error('Errore nel recupero formazioni:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero delle formazioni' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const membership = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 404 })
    }

    const body = await req.json()
    const {
      employeeId,
      trainingType,
      title,
      description,
      hoursRequired,
      provider,
      instructor,
      location,
      startedAt,
      completedAt,
      expiresAt,
      certificateNumber,
      certificatePath
    } = body

    // Validazione
    if (!employeeId || !trainingType || !title || !hoursRequired) {
      return NextResponse.json(
        { error: 'Campi obbligatori mancanti' },
        { status: 400 }
      )
    }

    // Determina lo status
    let status: SafetyTrainingStatus = SafetyTrainingStatus.NOT_STARTED
    if (completedAt) {
      if (expiresAt && new Date(expiresAt) < new Date()) {
        status = SafetyTrainingStatus.EXPIRED
      } else {
        status = SafetyTrainingStatus.COMPLETED
      }
    } else if (startedAt) {
      status = SafetyTrainingStatus.IN_PROGRESS
    }

    const training = await prisma.safetyTraining.create({
      data: {
        tenantId: membership.tenantId,
        employeeId,
        trainingType,
        title,
        description,
        hoursRequired,
        hoursCompleted: completedAt ? hoursRequired : 0,
        provider,
        instructor,
        location,
        startedAt: startedAt ? new Date(startedAt) : null,
        completedAt: completedAt ? new Date(completedAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        certificateNumber,
        certificatePath,
        status
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true
          }
        }
      }
    })

    // Crea deadline se ha scadenza
    if (expiresAt) {
      await prisma.deadline.create({
        data: {
          tenantId: membership.tenantId,
          employeeId,
          title: `Scadenza formazione: ${title}`,
          description: `La formazione "${title}" scade il ${new Date(expiresAt).toLocaleDateString('it-IT')}`,
          type: 'TRAINING_EXPIRY',
          dueDate: new Date(expiresAt),
          status: 'PENDING',
          notify30Days: true,
          notify60Days: true,
          notify90Days: true
        }
      })
    }

    return NextResponse.json(training, { status: 201 })
  } catch (error) {
    console.error('Errore nella creazione formazione:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione della formazione' },
      { status: 500 }
    )
  }
}
