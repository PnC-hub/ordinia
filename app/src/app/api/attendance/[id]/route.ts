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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true, employee: true },
    })

    if (!user?.tenantId && !user?.employee?.tenantId) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 404 })
    }

    const tenantId = (user.tenantId || user.employee?.tenantId) as string
    const { id } = await params

    const entry = await prisma.timeEntry.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            jobTitle: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Timbratura non trovata' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error fetching attendance entry:', error)
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true, employee: true },
    })

    if (!user?.tenantId && !user?.employee?.tenantId) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 404 })
    }

    const tenantId = (user.tenantId || user.employee?.tenantId) as string
    const { id } = await params

    const body = await request.json()
    const { status, managerNotes } = body

    const existingEntry = await prisma.timeEntry.findFirst({
      where: {
        id,
        tenantId,
      },
    })

    if (!existingEntry) {
      return NextResponse.json({ error: 'Timbratura non trovata' }, { status: 404 })
    }

    const entry = await prisma.timeEntry.update({
      where: { id },
      data: {
        status,
        managerNotes,
        approvedBy: status === 'APPROVED' || status === 'REJECTED' ? user.id : undefined,
        approvedAt: status === 'APPROVED' || status === 'REJECTED' ? new Date() : undefined,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            jobTitle: true,
          },
        },
      },
    })

    // Log audit
    await logAudit({
      tenantId,
      userId: user.id,
      action: 'UPDATE',
      entityType: 'TimeEntry',
      entityId: entry.id,
      oldValue: { status: existingEntry.status },
      newValue: { status, managerNotes },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error updating attendance entry:', error)
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true, employee: true },
    })

    if (!user?.tenantId && !user?.employee?.tenantId) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 404 })
    }

    const tenantId = (user.tenantId || user.employee?.tenantId) as string
    const { id } = await params

    const entry = await prisma.timeEntry.findFirst({
      where: {
        id,
        tenantId,
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Timbratura non trovata' }, { status: 404 })
    }

    await prisma.timeEntry.delete({
      where: { id },
    })

    // Log audit
    await logAudit({
      tenantId,
      userId: user.id,
      action: 'DELETE',
      entityType: 'TimeEntry',
      entityId: entry.id,
      oldValue: entry,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting attendance entry:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
