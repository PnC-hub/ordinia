import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    const membership = await prisma.tenantMember.findFirst({ where: { userId: session.user.id } })
    if (!membership) return NextResponse.json({ error: 'Nessun tenant associato' }, { status: 404 })

    const tenantId = membership.tenantId
    const [totalArticles, publishedArticles, totalChecklists, totalEmployees, totalAcks, recentArticles] = await Promise.all([
      prisma.manualArticle.count({ where: { tenantId } }),
      prisma.manualArticle.count({ where: { tenantId, status: 'PUBLISHED' } }),
      prisma.manualChecklist.count({ where: { tenantId } }),
      prisma.employee.count({ where: { tenantId, status: 'ACTIVE' } }),
      prisma.manualAcknowledgment.count({ where: { article: { tenantId } } }),
      prisma.manualArticle.findMany({
        where: { tenantId }, include: { category: { select: { name: true, slug: true } }, _count: { select: { acknowledgments: true } } },
        orderBy: { updatedAt: 'desc' }, take: 10
      })
    ])

    const ackRate = publishedArticles > 0 && totalEmployees > 0 ? Math.round((totalAcks / (publishedArticles * totalEmployees)) * 100) : 0

    return NextResponse.json({
      stats: { totalArticles, publishedArticles, totalChecklists, acknowledgmentRate: ackRate },
      recentArticles
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
