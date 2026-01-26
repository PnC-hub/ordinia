import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

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

    const leave = await prisma.leaveRequest.findUnique({
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
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!leave) {
      return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404 })
    }

    // Verify access
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true, employee: true },
    })

    const tenantId = user?.tenantId || user?.employee?.tenantId

    if (leave.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // If employee, can only see their own
    if (user?.employee && !user.tenantId && leave.employeeId !== user.employee.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    return NextResponse.json(leave)
  } catch (error) {
    console.error('Error fetching leave:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, reviewNotes } = body

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true },
    })

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'Non autorizzato a modificare' }, { status: 403 })
    }

    // Get leave request
    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!leave) {
      return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404 })
    }

    if (leave.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Only pending requests can be modified
    if (leave.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Solo le richieste in attesa possono essere modificate' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    const oldValue = { status: leave.status }

    if (status) {
      updateData.status = status
      updateData.reviewedBy = user.id
      updateData.reviewedAt = new Date()
    }

    if (reviewNotes !== undefined) {
      updateData.reviewNotes = reviewNotes
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Log audit
    await logAudit({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'UPDATE',
      entityType: 'LeaveRequest',
      entityId: id,
      oldValue,
      newValue: { status, reviewNotes },
    })

    // Notify employee
    if (leave.employee.userId && status) {
      const statusMessages: Record<string, string> = {
        APPROVED: 'approvata',
        REJECTED: 'rifiutata',
        CANCELLED: 'annullata',
      }

      await prisma.notification.create({
        data: {
          tenantId: user.tenantId,
          userId: leave.employee.userId,
          type: 'LEAVE_APPROVED',
          title: `Richiesta ${statusMessages[status] || status}`,
          message: `La tua richiesta di ${leave.type} dal ${leave.startDate.toLocaleDateString('it-IT')} al ${leave.endDate.toLocaleDateString('it-IT')} è stata ${statusMessages[status] || status}`,
          entityType: 'LeaveRequest',
          entityId: id,
        },
      })
    }

    return NextResponse.json(updatedLeave)
  } catch (error) {
    console.error('Error updating leave:', error)
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

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true, employee: true },
    })

    // Get leave request
    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
    })

    if (!leave) {
      return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404 })
    }

    const tenantId = user?.tenantId || user?.employee?.tenantId

    if (leave.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Employees can only delete their own pending requests
    if (user?.employee && !user.tenantId) {
      if (leave.employeeId !== user.employee.id) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
      }
      if (leave.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'Solo le richieste in attesa possono essere eliminate' },
          { status: 400 }
        )
      }
    }

    await prisma.leaveRequest.delete({
      where: { id },
    })

    // Log audit
    await logAudit({
      tenantId: leave.tenantId,
      userId: session.user.id,
      action: 'DELETE',
      entityType: 'LeaveRequest',
      entityId: id,
      oldValue: leave,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting leave:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
