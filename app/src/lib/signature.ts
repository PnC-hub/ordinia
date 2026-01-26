import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { SignatureAction, SignatureStatus } from '@prisma/client'

// Interfaccia per i dati forensi
export interface ForensicData {
  ipAddress: string
  userAgent: string
  deviceFingerprint?: string
  geoLocation?: {
    city?: string
    region?: string
    country?: string
    lat?: number
    lng?: number
  }
}

// Interfaccia per i dati di lettura documento
export interface ReadingData {
  scrollPercentage: number
  timeOnDocument: number
  pagesViewed: number
  totalPages: number
}

// Interfaccia per i dati completi della firma
export interface SignatureData {
  version: string
  signedAt: string
  document: {
    id: string
    name: string
    hash: string
    version?: number
  }
  signer: {
    userId: string
    employeeId: string
    name: string
    email: string
  }
  verification: {
    passwordVerified: boolean
    passwordVerifiedAt?: string
    otpMethod: string
    otpVerified: boolean
    otpVerifiedAt?: string
    confirmationPhrase: string
    phraseVerifiedAt?: string
  }
  reading: {
    documentOpenedAt: string
    timeOnDocument: number
    scrollPercentage: number
    pagesViewed: number
    totalPages: number
  }
  forensics: ForensicData
  certificate?: {
    id: string
    generatedAt: string
    fileUrl: string
  }
}

/**
 * Calcola hash SHA-256 di un file/contenuto
 */
export function calculateHash(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

/**
 * Crea una nuova richiesta di firma
 */
export async function createSignatureRequest(
  tenantId: string,
  documentId: string,
  employeeId: string,
  requestedBy: string,
  options?: {
    dueDate?: Date
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
    requirePassword?: boolean
    requireOtp?: boolean
    requirePhrase?: boolean
    minReadingTime?: number
  }
) {
  return prisma.documentSignatureRequest.create({
    data: {
      tenantId,
      documentId,
      employeeId,
      requestedBy,
      dueDate: options?.dueDate,
      priority: options?.priority || 'NORMAL',
      requirePassword: options?.requirePassword ?? true,
      requireOtp: options?.requireOtp ?? true,
      requirePhrase: options?.requirePhrase ?? true,
      minReadingTime: options?.minReadingTime ?? 30,
    },
  })
}

/**
 * Registra un'azione nell'audit log della firma
 */
export async function logSignatureAction(
  signatureRequestId: string,
  tenantId: string,
  employeeId: string,
  action: SignatureAction,
  forensics: ForensicData,
  additionalData?: {
    passwordVerified?: boolean
    otpMethod?: string
    otpVerified?: boolean
    otpAttempts?: number
    confirmationPhrase?: string
    expectedPhrase?: string
    documentHash?: string
    scrollPercentage?: number
    timeOnDocument?: number
    pagesViewed?: number
    totalPages?: number
    metadata?: Record<string, unknown>
  }
) {
  return prisma.signatureAuditLog.create({
    data: {
      signatureRequestId,
      tenantId,
      employeeId,
      action,
      ipAddress: forensics.ipAddress,
      userAgent: forensics.userAgent,
      deviceFingerprint: forensics.deviceFingerprint,
      geoLocation: forensics.geoLocation,
      passwordVerified: additionalData?.passwordVerified,
      otpMethod: additionalData?.otpMethod,
      otpVerified: additionalData?.otpVerified,
      otpAttempts: additionalData?.otpAttempts,
      confirmationPhrase: additionalData?.confirmationPhrase,
      expectedPhrase: additionalData?.expectedPhrase,
      documentHash: additionalData?.documentHash,
      scrollPercentage: additionalData?.scrollPercentage,
      timeOnDocument: additionalData?.timeOnDocument,
      pagesViewed: additionalData?.pagesViewed,
      totalPages: additionalData?.totalPages,
      metadata: additionalData?.metadata as object | undefined,
    },
  })
}

/**
 * Aggiorna lo stato della richiesta firma
 */
export async function updateSignatureStatus(
  signatureRequestId: string,
  status: SignatureStatus,
  signatureData?: SignatureData
) {
  return prisma.documentSignatureRequest.update({
    where: { id: signatureRequestId },
    data: {
      status,
      ...(status === 'SIGNED'
        ? {
            signedAt: new Date(),
            signatureData: signatureData as object,
          }
        : {}),
    },
  })
}

/**
 * Verifica se il documento è stato letto abbastanza
 */
export function validateReadingRequirements(
  reading: ReadingData,
  minReadingTime: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (reading.scrollPercentage < 100) {
    errors.push('Devi scorrere tutto il documento prima di firmare.')
  }

  if (reading.timeOnDocument < minReadingTime) {
    errors.push(`Devi leggere il documento per almeno ${minReadingTime} secondi.`)
  }

  if (reading.pagesViewed < reading.totalPages) {
    errors.push(`Devi visualizzare tutte le ${reading.totalPages} pagine del documento.`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Genera la frase di conferma attesa
 */
export function generateExpectedPhrase(firstName: string, lastName: string): string {
  return `IO ${firstName.toUpperCase()} ${lastName.toUpperCase()} CONFERMO`
}

/**
 * Verifica la frase di conferma
 */
export function validateConfirmationPhrase(
  typed: string,
  expected: string
): boolean {
  // Normalizza: rimuovi spazi multipli, trim, uppercase
  const normalizedTyped = typed.trim().toUpperCase().replace(/\s+/g, ' ')
  const normalizedExpected = expected.trim().toUpperCase().replace(/\s+/g, ' ')
  return normalizedTyped === normalizedExpected
}

/**
 * Ottiene l'audit trail completo di una firma
 */
export async function getSignatureAuditTrail(signatureRequestId: string) {
  return prisma.signatureAuditLog.findMany({
    where: { signatureRequestId },
    orderBy: { timestamp: 'asc' },
  })
}

/**
 * Genera dati completi per la firma
 */
export function buildSignatureData(
  document: { id: string; name: string; content: string },
  signer: { userId: string; employeeId: string; firstName: string; lastName: string; email: string },
  verification: {
    passwordVerifiedAt: Date
    otpMethod: string
    otpVerifiedAt: Date
    phrase: string
    phraseVerifiedAt: Date
  },
  reading: ReadingData & { documentOpenedAt: Date },
  forensics: ForensicData
): SignatureData {
  return {
    version: '1.0',
    signedAt: new Date().toISOString(),
    document: {
      id: document.id,
      name: document.name,
      hash: `sha256:${calculateHash(document.content)}`,
    },
    signer: {
      userId: signer.userId,
      employeeId: signer.employeeId,
      name: `${signer.firstName} ${signer.lastName}`,
      email: signer.email,
    },
    verification: {
      passwordVerified: true,
      passwordVerifiedAt: verification.passwordVerifiedAt.toISOString(),
      otpMethod: verification.otpMethod,
      otpVerified: true,
      otpVerifiedAt: verification.otpVerifiedAt.toISOString(),
      confirmationPhrase: verification.phrase,
      phraseVerifiedAt: verification.phraseVerifiedAt.toISOString(),
    },
    reading: {
      documentOpenedAt: reading.documentOpenedAt.toISOString(),
      timeOnDocument: reading.timeOnDocument,
      scrollPercentage: reading.scrollPercentage,
      pagesViewed: reading.pagesViewed,
      totalPages: reading.totalPages,
    },
    forensics,
  }
}

/**
 * Verifica se una firma è valida (per audit)
 */
export async function verifySignature(signatureRequestId: string): Promise<{
  valid: boolean
  details: {
    hasPasswordVerification: boolean
    hasOtpVerification: boolean
    hasPhraseVerification: boolean
    hasFullReading: boolean
    hasForensicData: boolean
  }
}> {
  const auditLogs = await getSignatureAuditTrail(signatureRequestId)

  const hasPasswordVerification = auditLogs.some(
    log => log.action === 'PASSWORD_ENTERED' && log.passwordVerified
  )
  const hasOtpVerification = auditLogs.some(
    log => log.action === 'OTP_VERIFIED' && log.otpVerified
  )
  const hasPhraseVerification = auditLogs.some(
    log => log.action === 'PHRASE_VERIFIED'
  )
  const hasFullReading = auditLogs.some(
    log => log.scrollPercentage === 100
  )
  const hasForensicData = auditLogs.some(
    log => log.ipAddress && log.userAgent
  )

  const valid =
    hasPasswordVerification &&
    hasOtpVerification &&
    hasPhraseVerification &&
    hasFullReading &&
    hasForensicData

  return {
    valid,
    details: {
      hasPasswordVerification,
      hasOtpVerification,
      hasPhraseVerification,
      hasFullReading,
      hasForensicData,
    },
  }
}
