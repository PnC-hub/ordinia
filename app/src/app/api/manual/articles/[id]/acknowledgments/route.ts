import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const acks = await prisma.manualAcknowledgment.findMany({
      where: { articleId: id },
      include: { employee: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { acknowledgedAt: 'desc' }
    })
    return NextResponse.json(acks)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
