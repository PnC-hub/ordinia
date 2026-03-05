import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { chatWithBrainAI, BRAIN_SYSTEM_PROMPT, BRAIN_MAX_HISTORY } from '@/lib/brain/openai'
import { buildBrainContext } from '@/lib/brain/brainContext'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { message, conversationId, mode } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Messaggio richiesto' }, { status: 400 })
    }

    const tenantMember = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id },
      select: { tenantId: true },
    })
    const tenantId = tenantMember?.tenantId ?? null

    let conversation: { id: string; messages: { role: string; content: string }[] }

    if (conversationId) {
      const found = await prisma.brainConversation.findFirst({
        where: { id: conversationId, userId: session.user.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            select: { role: true, content: true },
          },
        },
      })
      if (!found) return NextResponse.json({ error: 'Conversazione non trovata' }, { status: 404 })
      conversation = found
    } else {
      const created = await prisma.brainConversation.create({
        data: {
          userId: session.user.id,
          tenantId,
          title: message.substring(0, 80),
        },
        include: { messages: true },
      })
      conversation = { ...created, messages: [] }
    }

    await prisma.brainMessage.create({
      data: { conversationId: conversation.id, role: 'user', content: message.trim() },
    })

    const context = await buildBrainContext(session.user.id, tenantId)

    const recentHistory = conversation.messages.slice(-BRAIN_MAX_HISTORY)
    const gptMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: mode === 'manual'
          ? `MODALITÀ: DETTATURA PROTOCOLLO\n\n${BRAIN_SYSTEM_PROMPT}\n\n## Dati Reali Aziendali\n${context.report}`
          : `${BRAIN_SYSTEM_PROMPT}\n\n## Dati Reali Aziendali\n${context.report}`,
      },
      ...recentHistory
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message.trim() },
    ]

    const aiResponse = await chatWithBrainAI(gptMessages)

    const savedMsg = await prisma.brainMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: aiResponse,
        contextData: context.rawData as object,
      },
    })

    await prisma.brainConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({
      response: aiResponse,
      conversationId: conversation.id,
      messageId: savedMsg.id,
    })
  } catch (error: unknown) {
    console.error('[Brain AI] Errore:', error)
    if (error instanceof Error && 'status' in error) {
      const apiErr = error as { status: number }
      if (apiErr.status === 429) return NextResponse.json({ error: 'Limite richieste raggiunto, riprova tra poco' }, { status: 429 })
    }
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
