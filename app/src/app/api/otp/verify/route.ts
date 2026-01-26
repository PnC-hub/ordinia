import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyOtp, verifyTotpCode } from '@/lib/otp'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { code, purpose, referenceId, method } = body

    if (!code || !purpose) {
      return NextResponse.json({ error: 'Codice e scopo richiesti' }, { status: 400 })
    }

    let isValid = false
    let errorMessage = 'Codice non valido o scaduto'
    let remainingAttempts: number | undefined

    if (method === 'totp') {
      // Verify TOTP
      isValid = await verifyTotpCode(session.user.id, code)
    } else {
      // Verify OTP from database
      const result = await verifyOtp(session.user.id, code, purpose, referenceId)
      isValid = result.valid
      if (result.error) errorMessage = result.error
      remainingAttempts = result.remainingAttempts
    }

    if (!isValid) {
      return NextResponse.json(
        { error: errorMessage, remainingAttempts },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json({ error: 'Errore nella verifica' }, { status: 500 })
  }
}
