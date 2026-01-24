import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// GET /api/data-change-requests - Get all data change requests
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

    const where: {
      tenantId: string
      employeeId?: string
      status?: string
    } = {
      tenantId: membership.tenantId,
    }

    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status

    const requests = await prisma.employeeDataChangeRequest.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching data change requests:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero richieste variazione dati' },
      { status: 500 }
    )
  }
}

// POST /api/data-change-requests - Create new data change request
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
      changeType,
      fieldName,
      oldValue,
      newValue,
      reason,
      documentPath,
    } = body

    // Validate required fields
    if (!employeeId || !changeType || !fieldName || !newValue) {
      return NextResponse.json(
        { error: 'Dipendente, tipo variazione, campo e nuovo valore sono obbligatori' },
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

    const request = await prisma.employeeDataChangeRequest.create({
      data: {
        tenantId: membership.tenantId,
        employeeId,
        changeType,
        fieldName,
        oldValue: oldValue || null,
        newValue,
        reason: reason || null,
        documentPath: documentPath || null,
        requestedBy: session.user.id,
        status: 'PENDING',
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
      entityType: 'EmployeeDataChangeRequest',
      entityId: request.id,
      newValue: {
        employeeId,
        changeType,
        fieldName,
        newValue,
      },
    })

    return NextResponse.json(request, { status: 201 })
  } catch (error) {
    console.error('Error creating data change request:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione richiesta variazione dati' },
      { status: 500 }
    )
  }
}
