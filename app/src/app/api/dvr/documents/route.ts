import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// GET /api/dvr/documents - Get all DVR documents for tenant
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Get user with tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true, employee: true },
    })

    const tenantId = user?.tenantId || user?.employee?.tenantId

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Nessun tenant associato' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const isActive = searchParams.get('isActive')

    const where: {
      tenantId: string
      isActive?: boolean
    } = {
      tenantId,
    }

    if (isActive === 'true') where.isActive = true
    if (isActive === 'false') where.isActive = false

    const documents = await prisma.dvrDocument.findMany({
      where,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            acknowledgments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching DVR documents:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero documenti DVR' },
      { status: 500 }
    )
  }
}

// POST /api/dvr/documents - Create a new DVR document
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Get user with tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true },
    })

    if (!user?.tenantId) {
      return NextResponse.json(
        { error: 'Non hai i permessi per questa operazione' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      title,
      version,
      description,
      filePath,
      fileName,
      fileSize,
      validFrom,
      validUntil,
    } = body

    // Validate required fields
    if (!title || !version || !validFrom || !filePath || !fileName) {
      return NextResponse.json(
        { error: 'Titolo, versione, data validità, file e nome file sono obbligatori' },
        { status: 400 }
      )
    }

    // Deactivate previous active documents
    await prisma.dvrDocument.updateMany({
      where: {
        tenantId: user.tenantId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    })

    // Create new document
    const document = await prisma.dvrDocument.create({
      data: {
        tenantId: user.tenantId,
        title,
        version,
        description: description || null,
        filePath,
        fileName,
        fileSize: fileSize || null,
        validFrom: new Date(validFrom),
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: true,
        uploadedBy: session.user.id,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Create acknowledgment records for all active employees
    const employees = await prisma.employee.findMany({
      where: {
        tenantId: user.tenantId,
        status: { not: 'TERMINATED' },
      },
      select: { id: true },
    })

    if (employees.length > 0) {
      await prisma.dvrAcknowledgment.createMany({
        data: employees.map((emp) => ({
          tenantId: user.tenantId as string,
          employeeId: emp.id,
          documentId: document.id,
          dvrVersion: version,
          dvrDate: new Date(validFrom),
        })),
        skipDuplicates: true,
      })
    }

    // Log audit
    await logAudit({
      tenantId: user.tenantId,
      userId: session.user.id,
      action: 'CREATE',
      entityType: 'DvrDocument',
      entityId: document.id,
      newValue: {
        title,
        version,
        fileName,
        employeesNotified: employees.length,
      },
    })

    // Create notification for employees
    const employeesWithUsers = await prisma.employee.findMany({
      where: {
        tenantId: user.tenantId,
        status: { not: 'TERMINATED' },
        userId: { not: null },
      },
      select: { userId: true },
    })

    if (employeesWithUsers.length > 0) {
      await prisma.notification.createMany({
        data: employeesWithUsers
          .filter((e) => e.userId)
          .map((e) => ({
            tenantId: user.tenantId as string,
            userId: e.userId as string,
            type: 'DOCUMENT_REMINDER',
            title: 'Nuovo DVR disponibile',
            message: `È stato caricato un nuovo Documento di Valutazione dei Rischi: ${title}. Prendine visione.`,
            entityType: 'DvrDocument',
            entityId: document.id,
          })),
      })
    }

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error creating DVR document:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione documento DVR' },
      { status: 500 }
    )
  }
}
