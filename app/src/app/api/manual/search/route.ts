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
    const q = searchParams.get('q')
    if (!q) return NextResponse.json({ results: [] })

    const articles = await prisma.manualArticle.findMany({
      where: {
        tenantId: membership.tenantId, status: 'PUBLISHED',
        OR: [{ title: { contains: q, mode: 'insensitive' } }, { content: { contains: q, mode: 'insensitive' } }]
      },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { updatedAt: 'desc' }, take: 20
    })
    return NextResponse.json({ results: articles })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
