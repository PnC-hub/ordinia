import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    const membership = await prisma.tenantMember.findFirst({ where: { userId: session.user.id } })
    if (!membership) return NextResponse.json({ error: 'Nessun tenant associato' }, { status: 404 })

    const article = await prisma.manualArticle.findFirst({
      where: { id, tenantId: membership.tenantId },
      include: {
        category: true,
        acknowledgments: { include: { employee: { select: { id: true, firstName: true, lastName: true } } } },
        _count: { select: { acknowledgments: true, revisions: true } }
      }
    })
    if (!article) return NextResponse.json({ error: 'Articolo non trovato' }, { status: 404 })
    return NextResponse.json(article)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    const membership = await prisma.tenantMember.findFirst({ where: { userId: session.user.id } })
    if (!membership) return NextResponse.json({ error: 'Nessun tenant associato' }, { status: 404 })

    const existing = await prisma.manualArticle.findFirst({ where: { id, tenantId: membership.tenantId } })
    if (!existing) return NextResponse.json({ error: 'Articolo non trovato' }, { status: 404 })

    const body = await req.json()
    const { title, content, categoryId, changeNote } = body
    const newVersion = existing.version + 1

    const article = await prisma.manualArticle.update({
      where: { id },
      data: { title, content, categoryId, version: newVersion, updatedBy: session.user.id }
    })

    if (content && content !== existing.content) {
      await prisma.manualRevision.create({
        data: { articleId: id, version: newVersion, content, changeNote: changeNote || `Aggiornamento v${newVersion}`, changedBy: session.user.id }
      })
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    const membership = await prisma.tenantMember.findFirst({ where: { userId: session.user.id } })
    if (!membership) return NextResponse.json({ error: 'Nessun tenant associato' }, { status: 404 })

    await prisma.manualArticle.updateMany({ where: { id, tenantId: membership.tenantId }, data: { status: 'ARCHIVED' } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
