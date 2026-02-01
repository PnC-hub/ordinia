import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }
    const membership = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id }
    })
    if (!membership) {
      return NextResponse.json({ error: 'Nessun tenant associato' }, { status: 404 })
    }

    const categories = await prisma.manualCategory.findMany({
      where: { tenantId: membership.tenantId, parentId: null },
      include: {
        children: {
          include: {
            _count: { select: { articles: true } }
          },
          orderBy: { order: 'asc' }
        },
        _count: { select: { articles: true } }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }
    const membership = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id }
    })
    if (!membership) {
      return NextResponse.json({ error: 'Nessun tenant associato' }, { status: 404 })
    }

    const body = await req.json()
    const { name, slug, icon, description, order, parentId } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Nome e slug obbligatori' }, { status: 400 })
    }

    const category = await prisma.manualCategory.create({
      data: {
        tenantId: membership.tenantId,
        name, slug, icon, description,
        order: order || 0,
        parentId: parentId || null
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
