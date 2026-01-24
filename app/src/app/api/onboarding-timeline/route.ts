import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// Default onboarding phases with order
const DEFAULT_PHASES = [
  // Pre-assunzione
  { phase: 'OFFER_LETTER', title: 'Lettera d\'offerta', order: 1 },
  { phase: 'DOCUMENTS_COLLECTION', title: 'Raccolta documenti', order: 2 },

  // Giorno 1
  { phase: 'WELCOME', title: 'Accoglienza', order: 10 },
  { phase: 'WORKSPACE_SETUP', title: 'Postazione lavoro', order: 11 },
  { phase: 'IT_ACCOUNTS', title: 'Account IT', order: 12 },
  { phase: 'BADGE_ACCESS', title: 'Badge e accessi', order: 13 },

  // Prima settimana
  { phase: 'COMPANY_ORIENTATION', title: 'Orientamento aziendale', order: 20 },
  { phase: 'TEAM_INTRODUCTION', title: 'Presentazione team', order: 21 },
  { phase: 'TOOLS_TRAINING', title: 'Formazione strumenti', order: 22 },

  // Sicurezza (D.Lgs. 81/2008)
  { phase: 'SAFETY_TRAINING_GENERAL', title: 'Formazione sicurezza generale (4h)', order: 30 },
  { phase: 'SAFETY_TRAINING_SPECIFIC', title: 'Formazione sicurezza specifica', order: 31 },
  { phase: 'DPI_DELIVERY', title: 'Consegna DPI', order: 32 },
  { phase: 'DVR_ACKNOWLEDGMENT', title: 'Presa visione DVR', order: 33 },
  { phase: 'EMERGENCY_PROCEDURES', title: 'Procedure emergenza', order: 34 },

  // Compliance
  { phase: 'PRIVACY_CONSENT', title: 'Consenso privacy GDPR', order: 40 },
  { phase: 'CONTRACT_SIGNING', title: 'Firma contratto', order: 41 },
  { phase: 'DISCIPLINARY_CODE', title: 'Presa visione codice disciplinare', order: 42 },
  { phase: 'CCNL_INFORMATION', title: 'Informativa CCNL', order: 43 },

  // Periodo prova
  { phase: 'PROBATION_REVIEW_30', title: 'Review 30 giorni', order: 60 },
  { phase: 'PROBATION_REVIEW_60', title: 'Review 60 giorni', order: 70 },
  { phase: 'PROBATION_FINAL', title: 'Esito periodo prova', order: 80 },
]

// GET /api/onboarding-timeline - Get timeline for an employee
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

    if (!employeeId) {
      return NextResponse.json(
        { error: 'ID dipendente obbligatorio' },
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

    const timeline = await prisma.onboardingTimeline.findMany({
      where: {
        tenantId: membership.tenantId,
        employeeId,
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        hireDate: employee.hireDate,
        probationEndsAt: employee.probationEndsAt,
      },
      timeline,
    })
  } catch (error) {
    console.error('Error fetching onboarding timeline:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero timeline onboarding' },
      { status: 500 }
    )
  }
}

// POST /api/onboarding-timeline - Initialize timeline for employee
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
        { error: 'Non hai i permessi' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { employeeId, phases } = body

    if (!employeeId) {
      return NextResponse.json(
        { error: 'ID dipendente obbligatorio' },
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

    // Check if timeline already exists
    const existing = await prisma.onboardingTimeline.findFirst({
      where: {
        tenantId: membership.tenantId,
        employeeId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Timeline già esistente per questo dipendente' },
        { status: 409 }
      )
    }

    // Use provided phases or default
    const phasesToCreate = phases || DEFAULT_PHASES

    // Calculate due dates based on hire date
    const hireDate = new Date(employee.hireDate)

    const timelineItems = await prisma.onboardingTimeline.createMany({
      data: phasesToCreate.map((p: { phase: string; title: string; order: number; description?: string; dueDate?: string }) => {
        // Calculate due date based on phase
        let dueDate: Date | null = null
        if (p.order < 10) {
          // Pre-hire: due on hire date
          dueDate = hireDate
        } else if (p.order < 20) {
          // Day 1
          dueDate = hireDate
        } else if (p.order < 30) {
          // First week
          dueDate = new Date(hireDate)
          dueDate.setDate(dueDate.getDate() + 7)
        } else if (p.order < 40) {
          // Safety training: within 60 days
          dueDate = new Date(hireDate)
          dueDate.setDate(dueDate.getDate() + 60)
        } else if (p.order < 50) {
          // Compliance: first week
          dueDate = new Date(hireDate)
          dueDate.setDate(dueDate.getDate() + 7)
        } else if (p.phase === 'PROBATION_REVIEW_30') {
          dueDate = new Date(hireDate)
          dueDate.setDate(dueDate.getDate() + 30)
        } else if (p.phase === 'PROBATION_REVIEW_60') {
          dueDate = new Date(hireDate)
          dueDate.setDate(dueDate.getDate() + 60)
        } else if (p.phase === 'PROBATION_FINAL' && employee.probationEndsAt) {
          dueDate = new Date(employee.probationEndsAt)
        }

        return {
          tenantId: membership.tenantId,
          employeeId,
          phase: p.phase,
          title: p.title,
          description: p.description || null,
          order: p.order,
          dueDate,
          status: 'PENDING',
        }
      }),
    })

    // Log audit
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'CREATE',
      entityType: 'OnboardingTimeline',
      entityId: employeeId,
      newValue: { employeeId, phasesCreated: timelineItems.count },
    })

    // Fetch created items
    const timeline = await prisma.onboardingTimeline.findMany({
      where: {
        tenantId: membership.tenantId,
        employeeId,
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(
      {
        success: true,
        created: timelineItems.count,
        timeline,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating onboarding timeline:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione timeline onboarding' },
      { status: 500 }
    )
  }
}
