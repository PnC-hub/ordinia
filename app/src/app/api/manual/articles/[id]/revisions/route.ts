import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const revisions = await prisma.manualRevision.findMany({
      where: { articleId: id },
      orderBy: { version: 'desc' }
    })
    return NextResponse.json(revisions)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
