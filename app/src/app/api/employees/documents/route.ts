import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { DocumentType } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const membership = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Nessun tenant associato' }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const employeeId = formData.get('employeeId') as string
    const expiresAt = formData.get('expiresAt') as string | null

    // Validate required fields
    if (!file || !name || !type || !employeeId) {
      return NextResponse.json({
        error: 'File, nome, tipo e dipendente sono obbligatori'
      }, { status: 400 })
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        error: 'Il file non può superare i 10MB'
      }, { status: 400 })
    }

    // Verify employee belongs to tenant
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId: membership.tenantId
      }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Dipendente non trovato' }, { status: 404 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'documents', membership.tenantId)
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const ext = path.extname(file.name)
    const timestamp = Date.now()
    const safeFileName = `${employeeId}_${timestamp}${ext}`
    const filePath = path.join(uploadsDir, safeFileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Store relative path for database
    const relativePath = `/uploads/documents/${membership.tenantId}/${safeFileName}`

    // Create document record
    const document = await prisma.document.create({
      data: {
        tenantId: membership.tenantId,
        employeeId,
        name,
        type: type as DocumentType,
        filePath: relativePath,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    })

    // Log audit event
    await logAudit({
      tenantId: membership.tenantId,
      userId: session.user.id,
      action: 'CREATE',
      entityType: 'EmployeeDocument',
      entityId: document.id,
      newValue: {
        name,
        type,
        employeeId
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json({ error: 'Errore durante il caricamento' }, { status: 500 })
  }
}
