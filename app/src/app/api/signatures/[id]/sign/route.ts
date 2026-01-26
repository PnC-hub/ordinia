import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateHash, logSignatureAction, buildSignatureData, updateSignatureStatus, type ForensicData } from '@/lib/signature'
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

    const { id } = await params
    const body = await request.json()
    const {
      passwordVerified,
      otpVerified,
      confirmationPhrase,
      scrollPercentage,
      timeOnDocument,
      geoLocation,
      otpMethod,
    } = body

    // Validate required fields
    if (!passwordVerified || !otpVerified || !confirmationPhrase) {
      return NextResponse.json(
        { error: 'Verifica incompleta. Completa tutti i passaggi.' },
        { status: 400 }
      )
    }

    // Get user and employee
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    })

    if (!user?.employee) {
      return NextResponse.json({ error: 'Profilo dipendente non trovato' }, { status: 404 })
    }

    // Get signature request
    const signatureRequest = await prisma.documentSignatureRequest.findUnique({
      where: { id },
      include: {
        document: true,
        employee: true,
      },
    })

    if (!signatureRequest) {
      return NextResponse.json({ error: 'Richiesta di firma non trovata' }, { status: 404 })
    }

    // Verify employee matches
    if (signatureRequest.employeeId !== user.employee.id) {
      return NextResponse.json({ error: 'Non autorizzato a firmare questo documento' }, { status: 403 })
    }

    // Verify status
    if (signatureRequest.status !== 'PENDING' && signatureRequest.status !== 'VIEWED') {
      return NextResponse.json({ error: 'Documento non disponibile per la firma' }, { status: 400 })
    }

    // Get forensic data
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Calculate document hash using file path as content reference
    const documentContent = signatureRequest.document.filePath || signatureRequest.document.name
    const documentHash = calculateHash(documentContent)

    // Build forensic data
    const forensics: ForensicData = {
      ipAddress,
      userAgent,
      geoLocation,
    }

    // Build signature data
    const now = new Date()
    const signatureData = buildSignatureData(
      {
        id: signatureRequest.documentId,
        name: signatureRequest.document.name,
        content: documentContent,
      },
      {
        userId: user.id,
        employeeId: user.employee.id,
        firstName: user.employee.firstName,
        lastName: user.employee.lastName,
        email: user.email || '',
      },
      {
        passwordVerifiedAt: now,
        otpMethod: otpMethod || 'EMAIL',
        otpVerifiedAt: now,
        phrase: confirmationPhrase,
        phraseVerifiedAt: now,
      },
      {
        scrollPercentage: scrollPercentage || 100,
        timeOnDocument: timeOnDocument || 0,
        pagesViewed: 1,
        totalPages: 1,
        documentOpenedAt: now,
      },
      forensics
    )

    // Update signature request status
    await updateSignatureStatus(id, 'SIGNED', signatureData)

    // Log signature audit trail
    await logSignatureAction(
      id,
      signatureRequest.document.tenantId,
      user.employee.id,
      'SIGNED',
      forensics,
      {
        documentHash,
        confirmationPhrase,
        scrollPercentage: scrollPercentage || 100,
        timeOnDocument: timeOnDocument || 0,
        otpMethod: otpMethod || 'EMAIL',
        otpVerified: true,
        passwordVerified: true,
      }
    )

    // Log general audit
    await logAudit({
      tenantId: signatureRequest.document.tenantId,
      userId: user.id,
      action: 'UPDATE',
      entityType: 'DocumentSignatureRequest',
      entityId: id,
      oldValue: { status: signatureRequest.status },
      newValue: { status: 'SIGNED' },
      details: {
        documentId: signatureRequest.documentId,
        documentName: signatureRequest.document.name,
      },
    })

    // Create notification for requester
    if (signatureRequest.requestedBy) {
      await prisma.notification.create({
        data: {
          tenantId: signatureRequest.document.tenantId,
          userId: signatureRequest.requestedBy,
          type: 'DOCUMENT_SIGNED',
          title: 'Documento firmato',
          message: `${user.employee.firstName} ${user.employee.lastName} ha firmato "${signatureRequest.document.name}"`,
          entityType: 'DocumentSignatureRequest',
          entityId: id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      signedAt: signatureData.signedAt,
      signatureHash: signatureData.document.hash,
    })
  } catch (error) {
    console.error('Error signing document:', error)
    return NextResponse.json({ error: 'Errore durante la firma' }, { status: 500 })
  }
}
