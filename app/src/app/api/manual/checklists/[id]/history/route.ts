import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [executions, total] = await Promise.all([
      prisma.manualChecklistExecution.findMany({
        where: { checklistId: id },
        orderBy: { executedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.manualChecklistExecution.count({ where: { checklistId: id } })
    ])
    return NextResponse.json({ executions, total, page, limit })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
