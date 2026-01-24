import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// GET /api/disciplinary - Get all disciplinary procedures for tenant
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

    // Only OWNER, ADMIN, HR_MANAGER can view disciplinary procedures
    if (!['OWNER', 'ADMIN', 'HR_MANAGER'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi per questa operazione' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')

    const where: {
      tenantId: string
      employeeId?: string
      status?: string
    } = {
      tenantId: membership.tenantId,
    }

    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status

    const procedures = await prisma.disciplinaryProcedure.findMany({
      where,
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
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(procedures)
  } catch (error) {
    console.error('Error fetching disciplinary procedures:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero procedure disciplinari' },
      { status: 500 }
    )
  }
}

// POST /api/disciplinary - Create new disciplinary procedure
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

    // Only OWNER, ADMIN, HR_MANAGER can create disciplinary procedures
    if (!['OWNER', 'ADMIN', 'HR_MANAGER'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi per questa operazione' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      employeeId,
      infractionType,
      infractionDate,
      infractionDescription,
    } = body

    // Validate required fields
    if (!employeeId || !infractionType || !infractionDate || !infractionDescription) {
      return NextResponse.json(
        { error: 'Dipendente, tipo infrazione, data e descrizione sono obbligatori' },
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

    const procedure = await prisma.disciplinaryProcedure.create({
      data: {
        tenantId: membership.tenantId,
        employeeId,
        infractionType,
        infractionDate: new Date(infractionDate),
        infractionDescription,
        status: 'DRAFT',
        createdBy: session.user.id,
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
      action: 'CREATE',
      entityType: 'DisciplinaryProcedure',
      entityId: procedure.id,
      newValue: {
        employeeId,
        infractionType,
        infractionDate,
      },
    })

    return NextResponse.json(procedure, { status: 201 })
  } catch (error) {
    console.error('Error creating disciplinary procedure:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione procedura disciplinare' },
      { status: 500 }
    )
  }
}
