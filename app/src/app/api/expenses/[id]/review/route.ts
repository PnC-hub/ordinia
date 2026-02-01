import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { action, reason } = body

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Azione non valida' }, { status: 400 })
    }

    if (action === 'reject' && !reason) {
      return NextResponse.json(
        { error: 'Il motivo del rifiuto è obbligatorio' },
        { status: 400 }
      )
    }

    const { id } = await params

    const expense = await prisma.expenseRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userId: true,
          },
        },
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Nota spese non trovata' }, { status: 404 })
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.tenantId || user.tenantId !== expense.tenantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Check if user is admin or HR manager
    if (!['ADMIN', 'HR_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Permessi insufficienti' }, { status: 403 })
    }

    if (expense.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'La nota spese è già stata revisionata' },
        { status: 400 }
      )
    }

    // Update expense
    const updatedExpense = await prisma.expenseRequest.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        reviewedBy: user.id,
        reviewedAt: new Date(),
        reviewNotes: reason || null,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Log audit
    await logAudit({
      tenantId: expense.tenantId,
      userId: user.id,
      action: 'UPDATE',
      entityType: 'ExpenseRequest',
      entityId: expense.id,
      oldValue: { status: expense.status },
      newValue: { status: updatedExpense.status, reviewNotes: reason },
    })

    // Create notification for employee
    if (expense.employee.userId) {
      await prisma.notification.create({
        data: {
          tenantId: expense.tenantId,
          userId: expense.employee.userId,
          type: action === 'approve' ? 'EXPENSE_APPROVED' : 'EXPENSE_REJECTED',
          title: action === 'approve' ? 'Nota spese approvata' : 'Nota spese rifiutata',
          message:
            action === 'approve'
              ? `La tua nota spese di €${expense.amount.toString()} è stata approvata.`
              : `La tua nota spese di €${expense.amount.toString()} è stata rifiutata. Motivo: ${reason}`,
          entityType: 'ExpenseRequest',
          entityId: expense.id,
        },
      })
    }

    return NextResponse.json(updatedExpense)
  } catch (error) {
    console.error('Error reviewing expense:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
