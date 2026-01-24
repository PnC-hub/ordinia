import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { randomBytes } from 'crypto'

// Generate unique access code for anonymous reporting
function generateAccessCode(): string {
  return randomBytes(8).toString('hex').toUpperCase()
}

// GET /api/whistleblowing - Get all reports for tenant (admin only)
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

    // Only OWNER and ADMIN can view whistleblowing reports
    if (!['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi per visualizzare le segnalazioni' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    const where: {
      tenantId: string
      status?: string
      category?: string
    } = {
      tenantId: membership.tenantId,
    }

    if (status) where.status = status
    if (category) where.category = category

    const reports = await prisma.whistleblowingReport.findMany({
      where,
      select: {
        id: true,
        reporterType: true,
        // Hide reporter info for anonymous reports
        reporterName: true,
        reportDate: true,
        category: true,
        title: true,
        status: true,
        assignedTo: true,
        acknowledgedAt: true,
        closedAt: true,
        createdAt: true,
        _count: {
          select: {
            messages: true,
            documents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Mask reporter info for anonymous reports
    const maskedReports = reports.map((report) => ({
      ...report,
      reporterName: report.reporterType === 'ANONYMOUS' ? null : report.reporterName,
    }))

    return NextResponse.json(maskedReports)
  } catch (error) {
    console.error('Error fetching whistleblowing reports:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero segnalazioni' },
      { status: 500 }
    )
  }
}

// POST /api/whistleblowing - Create new report (public endpoint for employees)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      tenantSlug,
      reporterType,
      reporterName,
      reporterEmail,
      reporterPhone,
      reporterRole,
      category,
      title,
      description,
      personsInvolved,
      evidence,
    } = body

    // Validate required fields
    if (!tenantSlug || !reporterType || !category || !title || !description) {
      return NextResponse.json(
        { error: 'Tipo segnalante, categoria, titolo e descrizione sono obbligatori' },
        { status: 400 }
      )
    }

    // Find tenant by slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Organizzazione non trovata' },
        { status: 404 }
      )
    }

    // Generate unique access code
    let accessCode = generateAccessCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.whistleblowingReport.findUnique({
        where: { accessCode },
      })
      if (!existing) break
      accessCode = generateAccessCode()
      attempts++
    }

    const report = await prisma.whistleblowingReport.create({
      data: {
        tenantId: tenant.id,
        reporterType,
        reporterName: reporterType !== 'ANONYMOUS' ? reporterName : null,
        reporterEmail: reporterType !== 'ANONYMOUS' ? reporterEmail : null,
        reporterPhone: reporterType !== 'ANONYMOUS' ? reporterPhone : null,
        reporterRole: reporterRole || null,
        category,
        title,
        description,
        personsInvolved: personsInvolved || null,
        evidence: evidence || null,
        accessCode,
        status: 'RECEIVED',
      },
    })

    // Log audit (no user ID for anonymous reports)
    await logAudit({
      tenantId: tenant.id,
      userId: null,
      action: 'CREATE',
      entityType: 'WhistleblowingReport',
      entityId: report.id,
      newValue: {
        category,
        reporterType,
        // Don't log sensitive info
      },
    })

    // Return only the access code to the reporter
    return NextResponse.json(
      {
        success: true,
        accessCode,
        message: 'Segnalazione inviata con successo. Conserva il codice di accesso per seguire lo stato della segnalazione.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating whistleblowing report:', error)
    return NextResponse.json(
      { error: 'Errore nell\'invio della segnalazione' },
      { status: 500 }
    )
  }
}
