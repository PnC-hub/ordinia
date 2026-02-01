import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
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
            email: true,
            department: true,
          },
        },
        receipts: true,
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Nota spese non trovata' }, { status: 404 })
    }

    // Check access
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    })

    const tenantId = user?.tenantId || user?.employee?.tenantId
    if (expense.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // If employee, can only see own expenses
    if (user?.employee && !user.tenantId && expense.employeeId !== user.employee.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { id } = await params

    const expense = await prisma.expenseRequest.findUnique({
      where: { id },
      include: { employee: true },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Nota spese non trovata' }, { status: 404 })
    }

    // Check access
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    })

    const tenantId = user?.tenantId || user?.employee?.tenantId
    if (expense.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Only owner/admin or the employee can delete (if pending)
    const isOwner = user?.tenantId === expense.tenantId
    const isEmployee = user?.employee?.id === expense.employeeId

    if (!isOwner && !isEmployee) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    if (expense.status !== 'PENDING' && expense.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Impossibile eliminare una nota spese già approvata' },
        { status: 400 }
      )
    }

    await prisma.expenseRequest.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
