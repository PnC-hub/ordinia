import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { id } = await params
  const conv = await prisma.brainConversation.findFirst({
    where: { id, userId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, role: true, content: true, createdAt: true },
      },
    },
  })

  if (!conv) return NextResponse.json({ error: 'Non trovata' }, { status: 404 })

  return NextResponse.json({
    id: conv.id, title: conv.title, createdAt: conv.createdAt,
    messages: conv.messages,
  })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { id } = await params
  const conv = await prisma.brainConversation.findFirst({ where: { id, userId: session.user.id } })
  if (!conv) return NextResponse.json({ error: 'Non trovata' }, { status: 404 })

  await prisma.brainConversation.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
