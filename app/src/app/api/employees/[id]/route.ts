import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/employees/[id] - Get single employee
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { id } = await params

    const membership = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Nessun tenant associato' }, { status: 404 })
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id,
        tenantId: membership.tenantId
      }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Dipendente non trovato' }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

// PUT /api/employees/[id] - Update employee
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { id } = await params

    const membership = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Nessun tenant associato' }, { status: 404 })
    }

    // Check if employee exists and belongs to tenant
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id,
        tenantId: membership.tenantId
      }
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Dipendente non trovato' }, { status: 404 })
    }

    const body = await req.json()
    const {
      firstName,
      lastName,
      fiscalCode,
      email,
      phone,
      birthDate,
      birthPlace,
      address,
      hireDate,
      endDate,
      contractType,
      jobTitle,
      department,
      ccnlLevel,
      probationEndsAt,
      status
    } = body

    // Validate required fields
    if (!firstName || !lastName || !hireDate || !contractType) {
      return NextResponse.json({
        error: 'Nome, cognome, data assunzione e tipo contratto sono obbligatori'
      }, { status: 400 })
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        firstName,
        lastName,
        fiscalCode: fiscalCode || null,
        email: email || null,
        phone: phone || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        birthPlace: birthPlace || null,
        address: address || null,
        hireDate: new Date(hireDate),
        endDate: endDate ? new Date(endDate) : null,
        contractType,
        jobTitle: jobTitle || null,
        department: department || null,
        ccnlLevel: ccnlLevel || null,
        probationEndsAt: probationEndsAt ? new Date(probationEndsAt) : null,
        status: status || existingEmployee.status
      }
    })

    // Log audit event
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'UPDATE',
      entityType: 'Employee',
      entityId: employee.id,
      oldValue: {
        firstName: existingEmployee.firstName,
        lastName: existingEmployee.lastName,
        status: existingEmployee.status
      },
      newValue: {
        firstName,
        lastName,
        status: status || existingEmployee.status
      }
    })

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json({ error: 'Errore durante il salvataggio' }, { status: 500 })
  }
}

// DELETE /api/employees/[id] - Delete employee
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { id } = await params

    const membership = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Nessun tenant associato' }, { status: 404 })
    }

    // Check if employee exists and belongs to tenant
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id,
        tenantId: membership.tenantId
      }
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Dipendente non trovato' }, { status: 404 })
    }

    await prisma.employee.delete({
      where: { id }
    })

    // Log audit event
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'DELETE',
      entityType: 'Employee',
      entityId: id,
      oldValue: {
        firstName: existingEmployee.firstName,
        lastName: existingEmployee.lastName
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json({ error: 'Errore durante l\'eliminazione' }, { status: 500 })
  }
}
