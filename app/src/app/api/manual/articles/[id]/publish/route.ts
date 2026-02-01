import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    const membership = await prisma.tenantMember.findFirst({ where: { userId: session.user.id } })
    if (!membership) return NextResponse.json({ error: 'Nessun tenant associato' }, { status: 404 })

    const article = await prisma.manualArticle.updateMany({
      where: { id, tenantId: membership.tenantId },
      data: { status: 'PUBLISHED', publishedAt: new Date(), updatedBy: session.user.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
