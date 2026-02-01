import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

/**
 * POST /api/consultant/[clientId]/payslips/upload
 *
 * Uploads payslips and distributes them to employees
 * Supports bulk upload with automatic or manual assignment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clientId } = await params

    // Verify consultant has access to this client
    const access = await prisma.consultantClient.findFirst({
      where: {
        consultantId: session.user.id,
        tenantId: clientId,
        isActive: true,
      },
    })

    if (!access) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Parse form data
    const formData = await req.formData()
    const period = formData.get('period') as string
    const manualMode = formData.get('manualMode') === 'true'
    const files = formData.getAll('files') as File[]

    if (!period || files.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get all employees
    const employees = await prisma.employee.findMany({
      where: {
        tenantId: clientId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fiscalCode: true,
        email: true,
        userId: true,
      },
    })

    // Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), 'uploads', 'payslips', clientId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const results = []

    // Process each file
    for (const file of files) {
      try {
        let employeeId: string | null = null

        if (manualMode) {
          // Get manual assignment
          employeeId = formData.get(`assignment_${file.name}`) as string
        } else {
          // Auto-match by filename (e.g., "Mario_Rossi.pdf")
          const fileName = file.name.replace('.pdf', '')
          const nameParts = fileName.split('_')

          if (nameParts.length >= 2) {
            const firstName = nameParts[0].toLowerCase()
            const lastName = nameParts[1].toLowerCase()

            const matchedEmployee = employees.find(
              (emp) =>
                emp.firstName.toLowerCase().includes(firstName) &&
                emp.lastName.toLowerCase().includes(lastName)
            )

            employeeId = matchedEmployee?.id || null
          }
        }

        if (!employeeId) {
          results.push({
            employeeId: null,
            employeeName: file.name,
            status: 'error',
            message: 'Dipendente non trovato o non assegnato',
          })
          continue
        }

        const employee = employees.find((e) => e.id === employeeId)

        if (!employee) {
          results.push({
            employeeId,
            employeeName: file.name,
            status: 'error',
            message: 'Dipendente non valido',
          })
          continue
        }

        // Save file
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const fileName = `${employee.id}_${period}.pdf`
        const filePath = path.join(uploadDir, fileName)
        await writeFile(filePath, buffer)

        const fileUrl = `/uploads/payslips/${clientId}/${fileName}`

        // Check if payslip already exists for this period
        const existingPayslip = await prisma.payslip.findUnique({
          where: {
            employeeId_period: {
              employeeId,
              period,
            },
          },
        })

        if (existingPayslip) {
          // Update existing
          await prisma.payslip.update({
            where: { id: existingPayslip.id },
            data: {
              fileName,
              fileUrl,
              fileSize: buffer.length,
              uploadedBy: session.user.id,
              uploadedAt: new Date(),
            },
          })
        } else {
          // Create new
          await prisma.payslip.create({
            data: {
              employeeId,
              tenantId: clientId,
              period,
              fileName,
              fileUrl,
              fileSize: buffer.length,
              uploadedBy: session.user.id,
            },
          })
        }

        // Send notification to employee
        if (employee.userId) {
          await prisma.notification.create({
            data: {
              userId: employee.userId,
              tenantId: clientId,
              type: 'PAYSLIP_AVAILABLE',
              title: 'Nuovo Cedolino Disponibile',
              message: `Il cedolino per il periodo ${period} è disponibile`,
              link: '/payslips',
            },
          })
        }

        // Log audit
        await prisma.auditLog.create({
          data: {
            tenantId: clientId,
            userId: session.user.id,
            action: 'CREATE',
            entityType: 'Payslip',
            entityId: employeeId,
            details: {
              period,
              fileName,
              uploadedByConsultant: true,
            },
          },
        })

        results.push({
          employeeId,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          status: 'success',
          message: 'Cedolino caricato e notifica inviata',
        })
      } catch (error) {
        console.error('Error processing file:', file.name, error)
        results.push({
          employeeId: null,
          employeeName: file.name,
          status: 'error',
          message: 'Errore durante il caricamento',
        })
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error uploading payslips:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
