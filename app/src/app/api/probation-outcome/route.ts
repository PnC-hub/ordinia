import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// GET /api/probation-outcome - Get probation outcomes
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

    if (employeeId) {
      // Get specific employee's probation outcome
      const outcome = await prisma.probationOutcome.findUnique({
        where: { employeeId },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              hireDate: true,
              probationEndsAt: true,
              status: true,
            },
          },
        },
      })

      return NextResponse.json(outcome)
    }

    // Get all probation outcomes for tenant
    const outcomes = await prisma.probationOutcome.findMany({
      where: { tenantId: membership.tenantId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            hireDate: true,
            probationEndsAt: true,
            status: true,
          },
        },
      },
      orderBy: { evaluationDate: 'desc' },
    })

    return NextResponse.json(outcomes)
  } catch (error) {
    console.error('Error fetching probation outcomes:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero esiti periodo prova' },
      { status: 500 }
    )
  }
}

// POST /api/probation-outcome - Create probation outcome
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

    // Only OWNER, ADMIN, HR_MANAGER can create probation outcomes
    if (!['OWNER', 'ADMIN', 'HR_MANAGER'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      employeeId,
      technicalSkills,
      adaptability,
      teamwork,
      punctuality,
      initiative,
      strengths,
      areasForImprovement,
      evaluatorNotes,
      outcome,
      outcomeNotes,
      terminationDate,
      terminationReason,
    } = body

    // Validate required fields
    if (!employeeId || !outcome) {
      return NextResponse.json(
        { error: 'Dipendente ed esito sono obbligatori' },
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

    // Check if outcome already exists
    const existing = await prisma.probationOutcome.findUnique({
      where: { employeeId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Esito periodo prova già registrato per questo dipendente' },
        { status: 409 }
      )
    }

    // Calculate overall score
    const scores = [technicalSkills, adaptability, teamwork, punctuality, initiative].filter(Boolean)
    const overallScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null

    const probationOutcome = await prisma.probationOutcome.create({
      data: {
        tenantId: membership.tenantId,
        employeeId,
        probationStartDate: employee.hireDate,
        probationEndDate: employee.probationEndsAt || new Date(),
        evaluationDate: new Date(),
        evaluatedBy: session.user.id,
        technicalSkills: technicalSkills || null,
        adaptability: adaptability || null,
        teamwork: teamwork || null,
        punctuality: punctuality || null,
        initiative: initiative || null,
        overallScore,
        strengths: strengths || null,
        areasForImprovement: areasForImprovement || null,
        evaluatorNotes: evaluatorNotes || null,
        outcome,
        outcomeDate: new Date(),
        outcomeNotes: outcomeNotes || null,
        terminationDate: terminationDate ? new Date(terminationDate) : null,
        terminationReason: terminationReason || null,
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

    // Update employee status based on outcome
    let newStatus = employee.status
    if (outcome === 'CONFIRMED') {
      newStatus = 'ACTIVE'
    } else if (outcome === 'TERMINATED' || outcome === 'RESIGNED') {
      newStatus = 'TERMINATED'
    }

    if (newStatus !== employee.status) {
      await prisma.employee.update({
        where: { id: employeeId },
        data: {
          status: newStatus,
          endDate: outcome === 'TERMINATED' || outcome === 'RESIGNED'
            ? terminationDate ? new Date(terminationDate) : new Date()
            : employee.endDate,
        },
      })
    }

    // Log audit
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'CREATE',
      entityType: 'ProbationOutcome',
      entityId: probationOutcome.id,
      newValue: {
        employeeId,
        outcome,
        overallScore,
      },
    })

    return NextResponse.json(probationOutcome, { status: 201 })
  } catch (error) {
    console.error('Error creating probation outcome:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione esito periodo prova' },
      { status: 500 }
    )
  }
}
