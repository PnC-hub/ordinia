import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const body = await req.json()
    const { items, notes } = body

    const completedCount = Object.values(items || {}).filter(Boolean).length
    const totalCount = Object.keys(items || {}).length
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    const execution = await prisma.manualChecklistExecution.create({
      data: { checklistId: id, executedBy: session.user.id, items: items || {}, completionRate, notes }
    })
    return NextResponse.json(execution, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
