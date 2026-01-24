import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// GET /api/disciplinary-code - Get disciplinary code for tenant
export async function GET() {
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

    const code = await prisma.disciplinaryCode.findUnique({
      where: { tenantId: membership.tenantId },
    })

    return NextResponse.json(code)
  } catch (error) {
    console.error('Error fetching disciplinary code:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero codice disciplinare' },
      { status: 500 }
    )
  }
}

// POST /api/disciplinary-code - Create or update disciplinary code
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

    // Only OWNER, ADMIN can manage disciplinary code
    if (!['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi per questa operazione' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      version,
      content,
      postedAt,
      postedLocation,
      photoPath,
    } = body

    // Validate required fields
    if (!version || !content) {
      return NextResponse.json(
        { error: 'Versione e contenuto sono obbligatori' },
        { status: 400 }
      )
    }

    const existing = await prisma.disciplinaryCode.findUnique({
      where: { tenantId: membership.tenantId },
    })

    let code

    if (existing) {
      // Update existing
      code = await prisma.disciplinaryCode.update({
        where: { tenantId: membership.tenantId },
        data: {
          version,
          content,
          postedAt: postedAt ? new Date(postedAt) : existing.postedAt,
          postedBy: postedAt ? session.user.id : existing.postedBy,
          postedLocation: postedLocation ?? existing.postedLocation,
          photoPath: photoPath ?? existing.photoPath,
        },
      })

      // Log audit
      await logAudit({
        tenantId: membership.tenantId,
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'DisciplinaryCode',
        entityId: code.id,
        oldValue: { version: existing.version },
        newValue: { version: code.version },
      })
    } else {
      // Create new
      code = await prisma.disciplinaryCode.create({
        data: {
          tenantId: membership.tenantId,
          version,
          content,
          postedAt: postedAt ? new Date(postedAt) : null,
          postedBy: postedAt ? session.user.id : null,
          postedLocation: postedLocation || null,
          photoPath: photoPath || null,
        },
      })

      // Log audit
      await logAudit({
        tenantId: membership.tenantId,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'DisciplinaryCode',
        entityId: code.id,
        newValue: { version },
      })
    }

    return NextResponse.json(code, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('Error saving disciplinary code:', error)
    return NextResponse.json(
      { error: 'Errore nel salvataggio codice disciplinare' },
      { status: 500 }
    )
  }
}

// PATCH /api/disciplinary-code - Update posting info
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

    // Only OWNER, ADMIN, HR_MANAGER can update posting info
    if (!['OWNER', 'ADMIN', 'HR_MANAGER'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi per questa operazione' },
        { status: 403 }
      )
    }

    const existing = await prisma.disciplinaryCode.findUnique({
      where: { tenantId: membership.tenantId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Codice disciplinare non trovato. Crearne uno prima.' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { postedAt, postedLocation, photoPath } = body

    const code = await prisma.disciplinaryCode.update({
      where: { tenantId: membership.tenantId },
      data: {
        postedAt: postedAt ? new Date(postedAt) : existing.postedAt,
        postedBy: postedAt ? session.user.id : existing.postedBy,
        postedLocation: postedLocation ?? existing.postedLocation,
        photoPath: photoPath ?? existing.photoPath,
      },
    })

    // Log audit
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'UPDATE',
      entityType: 'DisciplinaryCode',
      entityId: code.id,
      newValue: {
        postedAt: code.postedAt,
        postedLocation: code.postedLocation,
      },
    })

    return NextResponse.json(code)
  } catch (error) {
    console.error('Error updating disciplinary code posting:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento affissione codice disciplinare' },
      { status: 500 }
    )
  }
}
