import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { payslips, period, notifyEmployees } = body

    // Validate
    if (!Array.isArray(payslips) || payslips.length === 0) {
      return NextResponse.json(
        { error: 'Nessun cedolino da caricare' },
        { status: 400 }
      )
    }

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return NextResponse.json(
        { error: 'Periodo deve essere in formato YYYY-MM' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    })

    if (!user?.tenantId && !user?.employee?.tenantId) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 404 })
    }

    const tenantId = (user.tenantId || user.employee?.tenantId) as string

    // Verify all employees belong to tenant
    const employeeIds = payslips.map(p => p.employeeId)
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: employeeIds },
        tenantId: tenantId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userId: true,
      },
    })

    if (employees.length !== employeeIds.length) {
      return NextResponse.json(
        { error: 'Alcuni dipendenti non sono validi' },
        { status: 400 }
      )
    }

    // Check for existing payslips
    const existing = await prisma.payslip.findMany({
      where: {
        employeeId: { in: employeeIds },
        period,
      },
    })

    if (existing.length > 0) {
      const existingNames = existing.map(p => {
        const emp = employees.find(e => e.id === p.employeeId)
        return `${emp?.firstName} ${emp?.lastName}`
      })
      return NextResponse.json(
        {
          error: `Esistono già cedolini per questo periodo per: ${existingNames.join(', ')}`,
          existing: existing.map(e => e.employeeId),
        },
        { status: 400 }
      )
    }

    // Create payslips
    const created = await prisma.$transaction(
      payslips.map(payslip =>
        prisma.payslip.create({
          data: {
            tenantId: tenantId,
            employeeId: payslip.employeeId,
            period,
            grossAmount: payslip.grossAmount || null,
            netAmount: payslip.netAmount || null,
            fileName: payslip.fileName,
            fileUrl: payslip.fileUrl,
            fileSize: payslip.fileSize || null,
            uploadedBy: user.id,
          },
        })
      )
    )

    // Log audit
    await logAudit({
      tenantId: tenantId,
      userId: user.id,
      action: 'CREATE',
      entityType: 'Payslip',
      entityId: 'bulk',
      details: {
        count: created.length,
        period,
        employees: employeeIds,
      },
    })

    // Send notifications if requested
    if (notifyEmployees) {
      const [year, month] = period.split('-')
      const monthNames = [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
      ]

      const notifications = employees
        .filter(emp => emp.userId)
        .map(emp => {
          const payslip = created.find(p => p.employeeId === emp.id)
          return prisma.notification.create({
            data: {
              tenantId: tenantId,
              userId: emp.userId!,
              type: 'PAYSLIP_AVAILABLE',
              title: 'Nuova busta paga disponibile',
              message: `La tua busta paga di ${monthNames[parseInt(month) - 1]} ${year} è ora disponibile`,
              link: `/payslips/${payslip?.id}`,
              entityType: 'Payslip',
              entityId: payslip?.id,
            },
          })
        })

      await prisma.$transaction(notifications)
    }

    return NextResponse.json({
      message: `${created.length} cedolini caricati con successo`,
      created: created.length,
      payslips: created,
    }, { status: 201 })
  } catch (error) {
    console.error('Error bulk uploading payslips:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
