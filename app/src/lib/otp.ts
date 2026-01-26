import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { OtpType } from '@prisma/client'

// Configurazione OTP
const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 5
const MAX_ATTEMPTS = 3

/**
 * Genera un codice OTP numerico
 */
export function generateOtpCode(): string {
  const min = Math.pow(10, OTP_LENGTH - 1)
  const max = Math.pow(10, OTP_LENGTH) - 1
  return crypto.randomInt(min, max).toString()
}

/**
 * Crea un nuovo codice OTP nel database
 */
export async function createOtp(
  userId: string,
  type: OtpType,
  purpose: string,
  referenceId?: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<{ code: string; expiresAt: Date }> {
  // Invalida eventuali OTP precedenti per lo stesso scopo
  await prisma.otpCode.updateMany({
    where: {
      userId,
      purpose,
      referenceId: referenceId ?? undefined,
      usedAt: null,
    },
    data: {
      usedAt: new Date(), // Marca come usati
    },
  })

  const code = generateOtpCode()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  await prisma.otpCode.create({
    data: {
      userId,
      code,
      type,
      purpose,
      referenceId,
      expiresAt,
      maxAttempts: MAX_ATTEMPTS,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    },
  })

  return { code, expiresAt }
}

/**
 * Verifica un codice OTP
 */
export async function verifyOtp(
  userId: string,
  code: string,
  purpose: string,
  referenceId?: string
): Promise<{ valid: boolean; error?: string; remainingAttempts?: number }> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId,
      purpose,
      referenceId: referenceId ?? undefined,
      usedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp) {
    return { valid: false, error: 'Codice OTP non trovato. Richiedi un nuovo codice.' }
  }

  // Verifica scadenza
  if (new Date() > otp.expiresAt) {
    return { valid: false, error: 'Codice OTP scaduto. Richiedi un nuovo codice.' }
  }

  // Verifica tentativi
  if (otp.attempts >= otp.maxAttempts) {
    return { valid: false, error: 'Troppi tentativi falliti. Richiedi un nuovo codice.' }
  }

  // Verifica codice
  if (otp.code !== code) {
    // Incrementa tentativi
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: {
        attempts: { increment: 1 },
        lastAttemptAt: new Date(),
      },
    })

    const remainingAttempts = otp.maxAttempts - otp.attempts - 1
    return {
      valid: false,
      error: `Codice errato. ${remainingAttempts} tentativ${remainingAttempts === 1 ? 'o' : 'i'} rimanent${remainingAttempts === 1 ? 'e' : 'i'}.`,
      remainingAttempts,
    }
  }

  // Codice valido - marca come usato
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { usedAt: new Date() },
  })

  return { valid: true }
}

/**
 * Invia OTP via email
 */
export async function sendOtpEmail(
  email: string,
  code: string,
  purpose: string,
  userName?: string
): Promise<boolean> {
  // Qui dovresti integrare con il tuo sistema di invio email
  // Per ora simulo l'invio

  const purposeLabels: Record<string, string> = {
    document_signature: 'firma del documento',
    login: 'accesso al tuo account',
    password_reset: 'reimpostazione password',
  }

  const purposeText = purposeLabels[purpose] || purpose

  console.log(`
    ===== OTP EMAIL =====
    To: ${email}
    Subject: Il tuo codice di verifica GeniusHR

    Ciao ${userName || ''},

    Il tuo codice di verifica per la ${purposeText} è:

    ${code}

    Il codice scade tra ${OTP_EXPIRY_MINUTES} minuti.

    Se non hai richiesto questo codice, ignora questa email.

    - Il team GeniusHR
    ====================
  `)

  // TODO: Implementare invio reale con nodemailer o servizio email
  // Per sviluppo, ritorna sempre true
  return true
}

/**
 * Invia OTP via SMS (richiede integrazione con servizio SMS)
 */
export async function sendOtpSms(
  phone: string,
  code: string,
  purpose: string
): Promise<boolean> {
  // TODO: Integrare con servizio SMS (es. Twilio, AWS SNS, etc.)

  console.log(`
    ===== OTP SMS =====
    To: ${phone}
    Message: GeniusHR - Il tuo codice di verifica è: ${code}. Scade tra ${OTP_EXPIRY_MINUTES} minuti.
    ====================
  `)

  // Per sviluppo, ritorna sempre true
  // In produzione, implementare integrazione reale
  return true
}

/**
 * Genera secret per TOTP (Google Authenticator)
 */
export function generateTotpSecret(): string {
  return crypto.randomBytes(20).toString('base64')
}

/**
 * Verifica TOTP code
 * Richiede libreria 'otplib' per implementazione reale
 */
export async function verifyTotpCode(
  userId: string,
  code: string
): Promise<boolean> {
  const totpSecret = await prisma.totpSecret.findUnique({
    where: { userId },
  })

  if (!totpSecret || !totpSecret.isVerified) {
    return false
  }

  // TODO: Implementare verifica TOTP reale con otplib
  // import { authenticator } from 'otplib'
  // return authenticator.verify({ token: code, secret: totpSecret.secret })

  // Per ora ritorna false (non implementato)
  return false
}

/**
 * Ottiene il metodo OTP preferito dell'utente
 */
export async function getPreferredOtpMethod(userId: string): Promise<OtpType> {
  // Verifica se ha TOTP configurato
  const totpSecret = await prisma.totpSecret.findUnique({
    where: { userId },
  })

  if (totpSecret?.isVerified) {
    return 'TOTP'
  }

  // Verifica se ha telefono per SMS
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  })

  if (user?.phone) {
    return 'SMS'
  }

  // Default: email
  return 'EMAIL'
}
