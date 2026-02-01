import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// GET single payslip (download tracking)
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

    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            userId: true,
          },
        },
      },
    })

    if (!payslip) {
      return NextResponse.json({ error: 'Cedolino non trovato' }, { status: 404 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    })

    // Check authorization
    const isOwner = user?.tenantId === payslip.tenantId
    const isEmployee = user?.employee?.id === payslip.employeeId

    if (!isOwner && !isEmployee) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Track download if employee
    if (isEmployee && !payslip.downloadedAt) {
      await prisma.payslip.update({
        where: { id },
        data: { downloadedAt: new Date() },
      })
    }

    return NextResponse.json(payslip)
  } catch (error) {
    console.error('Error fetching payslip:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

// PATCH - Mark as read/viewed
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body // 'mark_viewed' | 'mark_downloaded'

    const { id } = await params

    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: { employee: true },
    })

    if (!payslip) {
      return NextResponse.json({ error: 'Cedolino non trovato' }, { status: 404 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    })

    // Check authorization
    const isEmployee = user?.employee?.id === payslip.employeeId

    if (!isEmployee) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Get IP from headers
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    const updateData: any = {}

    if (action === 'mark_viewed' && !payslip.viewedAt) {
      updateData.viewedAt = new Date()
      updateData.viewedIp = ip
    }

    if (action === 'mark_downloaded' && !payslip.downloadedAt) {
      updateData.downloadedAt = new Date()
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(payslip)
    }

    const updated = await prisma.payslip.update({
      where: { id },
      data: updateData,
    })

    // Log audit
    await logAudit({
      tenantId: payslip.tenantId,
      userId: user.id,
      action: 'READ',
      entityType: 'Payslip',
      entityId: id,
      details: { action, ip },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating payslip:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

// DELETE payslip
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

    const payslip = await prisma.payslip.findUnique({
      where: { id },
    })

    if (!payslip) {
      return NextResponse.json({ error: 'Cedolino non trovato' }, { status: 404 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    // Only tenant owner can delete
    if (user?.tenantId !== payslip.tenantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    await prisma.payslip.delete({
      where: { id },
    })

    // Log audit
    await logAudit({
      tenantId: payslip.tenantId,
      userId: user.id,
      action: 'DELETE',
      entityType: 'Payslip',
      entityId: id,
      oldValue: payslip,
    })

    return NextResponse.json({ message: 'Cedolino eliminato' })
  } catch (error) {
    console.error('Error deleting payslip:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
