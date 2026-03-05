import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const conversations = await prisma.brainConversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, title: true, createdAt: true, updatedAt: true,
      _count: { select: { messages: true } },
    },
    take: 50,
  })

  return NextResponse.json(
    conversations.map((c) => ({
      id: c.id, title: c.title,
      messageCount: c._count.messages,
      createdAt: c.createdAt, updatedAt: c.updatedAt,
    }))
  )
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { title } = await request.json()

  const conv = await prisma.brainConversation.create({
    data: { userId: session.user.id, title: title || 'Nuova conversazione' },
  })

  return NextResponse.json({ id: conv.id, title: conv.title, createdAt: conv.createdAt })
}
