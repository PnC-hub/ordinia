import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// PUT /api/data-change-requests/[id] - Approve or reject request
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const membership = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Nessun tenant associato' },
        { status: 403 }
      )
    }

    // Only OWNER, ADMIN, HR_MANAGER can approve/reject
    if (!['OWNER', 'ADMIN', 'HR_MANAGER'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Non hai i permessi' },
        { status: 403 }
      )
    }

    const existingRequest = await prisma.employeeDataChangeRequest.findFirst({
      where: {
        id,
        tenantId: membership.tenantId,
      },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Richiesta non trovata' },
        { status: 404 }
      )
    }

    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Richiesta già elaborata' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { status, reviewNotes } = body

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Stato non valido' },
        { status: 400 }
      )
    }

    const request = await prisma.employeeDataChangeRequest.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        reviewNotes: reviewNotes || null,
      },
      include: {
        employee: true,
      },
    })

    // If approved, update the employee field
    if (status === 'APPROVED') {
      const fieldMapping: Record<string, string> = {
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        phone: 'phone',
        address: 'address',
        fiscalCode: 'fiscalCode',
        birthDate: 'birthDate',
        birthPlace: 'birthPlace',
      }

      const prismaField = fieldMapping[existingRequest.fieldName]
      if (prismaField) {
        const updateData: Record<string, unknown> = {}

        // Handle date fields
        if (['birthDate'].includes(prismaField)) {
          updateData[prismaField] = new Date(existingRequest.newValue)
        } else {
          updateData[prismaField] = existingRequest.newValue
        }

        await prisma.employee.update({
          where: { id: existingRequest.employeeId },
          data: updateData,
        })

        // Log the actual data change
        await logAudit({
          tenantId: membership.tenantId,
          userId: session.user.id,
          action: 'UPDATE',
          entityType: 'Employee',
          entityId: existingRequest.employeeId,
          oldValue: { [prismaField]: existingRequest.oldValue },
          newValue: { [prismaField]: existingRequest.newValue },
        })
      }
    }

    // Log request status change
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'UPDATE',
      entityType: 'EmployeeDataChangeRequest',
      entityId: request.id,
      oldValue: { status: 'PENDING' },
      newValue: { status },
    })

    return NextResponse.json(request)
  } catch (error) {
    console.error('Error updating data change request:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento richiesta' },
      { status: 500 }
    )
  }
}
