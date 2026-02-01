import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const templates = await prisma.manualArticle.findMany({
      where: { isTemplate: true, status: 'PUBLISHED' },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { order: 'asc' }
    })
    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    const membership = await prisma.tenantMember.findFirst({ where: { userId: session.user.id } })
    if (!membership) return NextResponse.json({ error: 'Nessun tenant associato' }, { status: 404 })

    const { templateIds } = await req.json()
    if (!templateIds?.length) return NextResponse.json({ error: 'IDs template obbligatori' }, { status: 400 })

    const templates = await prisma.manualArticle.findMany({ where: { id: { in: templateIds }, isTemplate: true }, include: { category: true } })
    let created = 0
    for (const t of templates) {
      await prisma.manualArticle.create({
        data: { tenantId: membership.tenantId, categoryId: t.categoryId, title: t.title, slug: `${t.slug}-${Date.now()}`, content: t.content, status: 'DRAFT', version: 1, createdBy: session.user.id, updatedBy: session.user.id }
      })
      created++
    }
    return NextResponse.json({ success: true, count: created }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
