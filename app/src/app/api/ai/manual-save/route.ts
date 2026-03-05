import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const MAX_CATEGORY_NAME = 100
const MAX_TITLE = 200
const MAX_CONTENT = 100_000
const MAX_SLUG_ATTEMPTS = 100

const ALLOWED_ROLES = ['OWNER', 'ADMIN', 'HR_MANAGER']

interface ManualSaveBody {
  categoryName?: unknown
  title?: unknown
  content?: unknown
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = (await request.json()) as ManualSaveBody

    if (typeof body.categoryName !== 'string' || typeof body.title !== 'string' || typeof body.content !== 'string') {
      return NextResponse.json({ error: 'I campi devono essere stringhe' }, { status: 400 })
    }

    const categoryName = body.categoryName.trim()
    const title = body.title.trim()
    const content = body.content.trim()

    if (!categoryName || !title || !content) {
      return NextResponse.json({ error: 'categoryName, title e content sono obbligatori' }, { status: 400 })
    }

    if (categoryName.length > MAX_CATEGORY_NAME) {
      return NextResponse.json({ error: 'categoryName troppo lungo (max 100 caratteri)' }, { status: 400 })
    }
    if (title.length > MAX_TITLE) {
      return NextResponse.json({ error: 'title troppo lungo (max 200 caratteri)' }, { status: 400 })
    }
    if (content.length > MAX_CONTENT) {
      return NextResponse.json({ error: 'content troppo lungo (max 100.000 caratteri)' }, { status: 400 })
    }

    const tenantMember = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id },
      select: { tenantId: true, role: true },
    })

    if (!tenantMember?.tenantId) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 400 })
    }

    if (!ALLOWED_ROLES.includes(tenantMember.role)) {
      return NextResponse.json({ error: 'Permessi insufficienti' }, { status: 403 })
    }

    const tenantId = tenantMember.tenantId

    // Trova o crea la categoria (con gestione race condition)
    let category = await prisma.manualCategory.findFirst({
      where: { tenantId, name: { equals: categoryName, mode: 'insensitive' } },
    })

    if (!category) {
      const baseSlug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)

      if (!baseSlug) {
        return NextResponse.json({ error: 'categoryName non produce uno slug valido' }, { status: 400 })
      }

      let uniqueSlug = baseSlug
      let attempt = 0
      while (attempt < MAX_SLUG_ATTEMPTS) {
        const existing = await prisma.manualCategory.findUnique({
          where: { tenantId_slug: { tenantId, slug: uniqueSlug } },
        })
        if (!existing) break
        attempt++
        uniqueSlug = `${baseSlug}-${attempt}`
      }
      if (attempt >= MAX_SLUG_ATTEMPTS) {
        return NextResponse.json({ error: 'Impossibile generare slug univoco per la categoria' }, { status: 409 })
      }

      try {
        category = await prisma.manualCategory.create({
          data: { tenantId, name: categoryName, slug: uniqueSlug },
        })
      } catch (e: unknown) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          // Race condition: categoria creata da un'altra richiesta concorrente
          category = await prisma.manualCategory.findFirst({
            where: { tenantId, name: { equals: categoryName, mode: 'insensitive' } },
          })
          if (!category) throw e
        } else {
          throw e
        }
      }
    }

    // Genera slug unico per l'articolo
    const baseArticleSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80)

    if (!baseArticleSlug) {
      return NextResponse.json({ error: 'title non produce uno slug valido' }, { status: 400 })
    }

    let uniqueArticleSlug = baseArticleSlug
    let articleAttempt = 0
    while (articleAttempt < MAX_SLUG_ATTEMPTS) {
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
    if (articleAttempt >= MAX_SLUG_ATTEMPTS) {
      return NextResponse.json({ error: `Impossibile generare slug univoco per l'articolo` }, { status: 409 })
    }

    const article = await prisma.manualArticle.create({
      data: {
        tenantId,
        categoryId: category.id,
        title,
        slug: uniqueArticleSlug,
        content,
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
        categoryName,
        slug: article.slug,
      },
    })
  } catch (error) {
    console.error('[manual-save] Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
