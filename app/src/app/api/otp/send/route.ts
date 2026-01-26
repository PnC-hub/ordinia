import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createOtp, sendOtpEmail } from '@/lib/otp'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { purpose, referenceId, method } = body

    if (!purpose) {
      return NextResponse.json({ error: 'Scopo richiesto' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, phone: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    }

    // Determine OTP type based on method
    let otpType: 'EMAIL' | 'SMS' | 'TOTP' = 'EMAIL'
    if (method === 'sms' && user.phone) {
      otpType = 'SMS'
    } else if (method === 'totp') {
      otpType = 'TOTP'
    }

    // For TOTP, user should use their authenticator app
    if (otpType === 'TOTP') {
      // Check if user has TOTP configured
      const totpSecret = await prisma.totpSecret.findUnique({
        where: { userId: user.id },
      })

      if (!totpSecret?.isVerified) {
        return NextResponse.json(
          { error: 'TOTP non configurato. Usa il metodo email.' },
          { status: 400 }
        )
      }

      // For TOTP, we don't need to send anything
      return NextResponse.json({
        success: true,
        method: 'totp',
        message: 'Usa il codice dalla tua app di autenticazione',
      })
    }

    // Create OTP
    const otp = await createOtp(user.id, otpType, purpose, referenceId, {
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    // Send OTP
    if (otpType === 'EMAIL') {
      if (!user.email) {
        return NextResponse.json({ error: 'Utente senza email' }, { status: 400 })
      }
      await sendOtpEmail(user.email, otp.code, purpose, user.name || undefined)
    } else if (otpType === 'SMS') {
      // SMS sending would go here
      // For now, we'll simulate it
      console.log(`[SMS] Sending OTP ${otp.code} to ${user.phone}`)
    }

    return NextResponse.json({
      success: true,
      method: otpType.toLowerCase(),
      message:
        otpType === 'EMAIL'
          ? `Codice inviato a ${user.email?.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`
          : `Codice inviato al numero ***${user.phone?.slice(-4)}`,
    })
  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json({ error: 'Errore nell\'invio del codice' }, { status: 500 })
  }
}
