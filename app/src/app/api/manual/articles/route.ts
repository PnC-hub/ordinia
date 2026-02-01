import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    const membership = await prisma.tenantMember.findFirst({ where: { userId: session.user.id } })
    if (!membership) return NextResponse.json({ error: 'Nessun tenant associato' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId')
    const categorySlug = searchParams.get('categorySlug')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const slug = searchParams.get('slug')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = { tenantId: membership.tenantId }
    if (categoryId) where.categoryId = categoryId
    if (categorySlug) where.category = { slug: categorySlug }
    if (status) where.status = status
    if (slug) where.slug = slug
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } }
    ]

    const [articles, total] = await Promise.all([
      prisma.manualArticle.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { acknowledgments: true, revisions: true } }
        },
        orderBy: { order: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.manualArticle.count({ where })
    ])

    return NextResponse.json({ articles, total, page, limit })
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

    const body = await req.json()
    const { title, slug, content, categoryId, status: articleStatus, isTemplate } = body

    if (!title || !slug || !content || !categoryId) {
      return NextResponse.json({ error: 'Campi obbligatori: title, slug, content, categoryId' }, { status: 400 })
    }

    const article = await prisma.manualArticle.create({
      data: {
        tenantId: membership.tenantId,
        categoryId, title, slug, content,
        status: articleStatus || 'DRAFT',
        isTemplate: isTemplate || false,
        version: 1,
        createdBy: session.user.id,
        updatedBy: session.user.id
      }
    })

    await prisma.manualRevision.create({
      data: { articleId: article.id, version: 1, content, changeNote: 'Creazione iniziale', changedBy: session.user.id }
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
