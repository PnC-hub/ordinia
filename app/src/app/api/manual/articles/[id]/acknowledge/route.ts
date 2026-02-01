import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { employee: true } })
    if (!user?.employee) return NextResponse.json({ error: 'Nessun dipendente associato' }, { status: 404 })

    const body = await req.json().catch(() => ({}))

    const ack = await prisma.manualAcknowledgment.upsert({
      where: { articleId_employeeId: { articleId: id, employeeId: user.employee.id } },
      update: { acknowledgedAt: new Date(), signature: body.signature || null },
      create: { articleId: id, employeeId: user.employee.id, signature: body.signature || null }
    })
    return NextResponse.json(ack, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
