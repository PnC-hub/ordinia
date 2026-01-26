import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const employeeId = searchParams.get('employeeId')

    // Get user and tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true, employee: true },
    })

    if (!user?.tenantId && !user?.employee?.tenantId) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 404 })
    }

    const tenantId = user.tenantId || user.employee?.tenantId

    const where: Record<string, unknown> = {
      document: {
        tenantId,
      },
    }

    if (status) {
      where.status = status
    }

    if (employeeId) {
      where.employeeId = employeeId
    }

    // If employee, only show their own signatures
    if (user.employee && !user.tenantId) {
      where.employeeId = user.employee.id
    }

    const signatures = await prisma.documentSignatureRequest.findMany({
      where,
      include: {
        document: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true,
          },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    })

    return NextResponse.json(signatures)
  } catch (error) {
    console.error('Error fetching signatures:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { documentId, employeeId, priority, dueDate } = body

    // Validate required fields
    if (!documentId || !employeeId) {
      return NextResponse.json(
        { error: 'documentId e employeeId sono obbligatori' },
        { status: 400 }
      )
    }

    // Get user and verify tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true },
    })

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Verify document belongs to tenant
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        tenantId: user.tenantId,
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Documento non trovato' }, { status: 404 })
    }

    // Verify employee belongs to tenant
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId: user.tenantId,
      },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Dipendente non trovato' }, { status: 404 })
    }

    // Create signature request
    const signatureRequest = await prisma.documentSignatureRequest.create({
      data: {
        tenantId: user.tenantId,
        documentId,
        employeeId,
        requestedBy: user.id,
        priority: priority || 'NORMAL',
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'PENDING',
      },
      include: {
        document: {
          select: {
            id: true,
            name: true,
          },
        },
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
      tenantId: user.tenantId,
      userId: user.id,
      action: 'CREATE',
      entityType: 'DocumentSignatureRequest',
      entityId: signatureRequest.id,
      newValue: {
        documentId,
        employeeId,
        priority,
        dueDate,
      },
    })

    // Create notification for employee
    if (employee.userId) {
      await prisma.notification.create({
        data: {
          tenantId: user.tenantId,
          userId: employee.userId,
          type: 'DOCUMENT_TO_SIGN',
          title: 'Documento da firmare',
          message: `Ti è stato richiesto di firmare: ${document.name}`,
          entityType: 'DocumentSignatureRequest',
          entityId: signatureRequest.id,
        },
      })
    }

    return NextResponse.json(signatureRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating signature request:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
