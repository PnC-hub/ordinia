import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// GET /api/dvr - Get all DVR acknowledgments for tenant
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
    const dvrVersion = searchParams.get('version')
    const acknowledged = searchParams.get('acknowledged')

    const where: {
      tenantId: string
      employeeId?: string
      dvrVersion?: string
      acknowledgedAt?: { not: null } | null
    } = {
      tenantId: membership.tenantId,
    }

    if (employeeId) where.employeeId = employeeId
    if (dvrVersion) where.dvrVersion = dvrVersion
    if (acknowledged === 'true') where.acknowledgedAt = { not: null }
    if (acknowledged === 'false') where.acknowledgedAt = null

    const acknowledgments = await prisma.dvrAcknowledgment.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            jobTitle: true,
            hireDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(acknowledgments)
  } catch (error) {
    console.error('Error fetching DVR acknowledgments:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero prese visione DVR' },
      { status: 500 }
    )
  }
}

// POST /api/dvr - Create DVR acknowledgment
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

    const body = await req.json()
    const {
      employeeId,
      dvrVersion,
      dvrDate,
      acknowledgedAt,
      signature,
      notes,
    } = body

    // Validate required fields
    if (!employeeId || !dvrVersion || !dvrDate) {
      return NextResponse.json(
        { error: 'Dipendente, versione DVR e data DVR sono obbligatori' },
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

    // Check if acknowledgment already exists
    const existing = await prisma.dvrAcknowledgment.findUnique({
      where: {
        employeeId_dvrVersion: {
          employeeId,
          dvrVersion,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Presa visione già registrata per questa versione DVR' },
        { status: 409 }
      )
    }

    const acknowledgment = await prisma.dvrAcknowledgment.create({
      data: {
        tenantId: membership.tenantId,
        employeeId,
        dvrVersion,
        dvrDate: new Date(dvrDate),
        acknowledgedAt: acknowledgedAt ? new Date(acknowledgedAt) : null,
        acknowledgedBy: acknowledgedAt ? session.user.id : null,
        signature: signature || null,
        notes: notes || null,
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
      entityType: 'DvrAcknowledgment',
      entityId: acknowledgment.id,
      newValue: {
        dvrVersion,
        employeeId,
        acknowledged: !!acknowledgedAt,
      },
    })

    return NextResponse.json(acknowledgment, { status: 201 })
  } catch (error) {
    console.error('Error creating DVR acknowledgment:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione presa visione DVR' },
      { status: 500 }
    )
  }
}

// PATCH /api/dvr - Bulk create DVR acknowledgments for all employees
export async function PATCH(req: Request) {
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
    const { dvrVersion, dvrDate } = body

    if (!dvrVersion || !dvrDate) {
      return NextResponse.json(
        { error: 'Versione DVR e data DVR sono obbligatori' },
        { status: 400 }
      )
    }

    // Get all active employees
    const employees = await prisma.employee.findMany({
      where: {
        tenantId: membership.tenantId,
        status: { not: 'TERMINATED' },
      },
      select: { id: true },
    })

    // Create acknowledgments for employees who don't have one yet
    const results = await Promise.all(
      employees.map(async (emp) => {
        try {
          const existing = await prisma.dvrAcknowledgment.findUnique({
            where: {
              employeeId_dvrVersion: {
                employeeId: emp.id,
                dvrVersion,
              },
            },
          })

          if (!existing) {
            return prisma.dvrAcknowledgment.create({
              data: {
                tenantId: membership.tenantId,
                employeeId: emp.id,
                dvrVersion,
                dvrDate: new Date(dvrDate),
              },
            })
          }
          return null
        } catch {
          return null
        }
      })
    )

    const created = results.filter(Boolean).length

    // Log audit
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'CREATE',
      entityType: 'DvrAcknowledgment',
      entityId: 'bulk',
      newValue: {
        dvrVersion,
        employeesCreated: created,
      },
    })

    return NextResponse.json({
      success: true,
      created,
      message: `Create ${created} prese visione DVR`,
    })
  } catch (error) {
    console.error('Error bulk creating DVR acknowledgments:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione massiva prese visione DVR' },
      { status: 500 }
    )
  }
}
