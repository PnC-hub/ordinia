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

    const checklists = await prisma.manualChecklist.findMany({
      where: { tenantId: membership.tenantId },
      include: {
        items: { orderBy: { order: 'asc' } },
        _count: { select: { executions: true } },
        executions: { orderBy: { executedAt: 'desc' }, take: 1 }
      },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(checklists)
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
    const { name, description, frequency, articleId, items } = body

    const checklist = await prisma.manualChecklist.create({
      data: {
        tenantId: membership.tenantId, name, description, frequency: frequency || 'ON_DEMAND', articleId,
        items: items ? { create: items.map((item: any, i: number) => ({ text: item.text, order: i, mandatory: item.mandatory ?? true })) } : undefined
      },
      include: { items: { orderBy: { order: 'asc' } } }
    })
    return NextResponse.json(checklist, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
