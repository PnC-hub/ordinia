import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { categoryName, title, content } = body

    if (!categoryName?.trim() || !title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'categoryName, title e content sono obbligatori' },
        { status: 400 }
      )
    }

    const tenantMember = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id },
      select: { tenantId: true },
    })
    if (!tenantMember?.tenantId) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 400 })
    }
    const tenantId = tenantMember.tenantId

    // Cerca o crea la categoria
    let category = await prisma.manualCategory.findFirst({
      where: { tenantId, name: { equals: categoryName.trim(), mode: 'insensitive' } },
    })

    if (!category) {
      const baseSlug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)

      let uniqueSlug = baseSlug
      let attempt = 0
      while (true) {
        const existing = await prisma.manualCategory.findUnique({
          where: { tenantId_slug: { tenantId, slug: uniqueSlug } },
        })
        if (!existing) break
        attempt++
        uniqueSlug = `${baseSlug}-${attempt}`
      }

      category = await prisma.manualCategory.create({
        data: { tenantId, name: categoryName.trim(), slug: uniqueSlug },
      })
    }

    // Genera slug unico per l'articolo
    const baseArticleSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80)

    let uniqueArticleSlug = baseArticleSlug
    let articleAttempt = 0
    while (true) {
      const existing = await prisma.manualArticle.findUnique({
        where: {
          tenantId_categoryId_slug: {
            tenantId,
            categoryId: category.id,
            slug: uniqueArticleSlug,
          },
        },
      })
      if (!existing) break
      articleAttempt++
      uniqueArticleSlug = `${baseArticleSlug}-${articleAttempt}`
    }

    const article = await prisma.manualArticle.create({
      data: {
        tenantId,
        categoryId: category.id,
        title: title.trim(),
        slug: uniqueArticleSlug,
        content: content.trim(),
        status: 'PUBLISHED',
        publishedAt: new Date(),
        createdBy: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        categoryName: categoryName.trim(),
        slug: article.slug,
      },
    })
  } catch (error) {
    console.error('[manual-save] Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
