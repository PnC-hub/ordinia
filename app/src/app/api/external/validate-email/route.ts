import { NextRequest, NextResponse } from 'next/server'
import { validateEmail } from '@/lib/external-api'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

/**
 * GET /api/external/validate-email
 *
 * Query params:
 *   email (required) – the email address to validate
 *
 * Example: /api/external/validate-email?email=test@gmail.com
 *
 * Response:
 *   {
 *     email: "test@gmail.com",
 *     formatValid: true,
 *     mxValid: true,
 *     mxRecords: ["gmail-smtp-in.l.google.com", ...],
 *     valid: true
 *   }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const emailParam = searchParams.get('email')

    if (!emailParam || emailParam.trim() === '') {
      return NextResponse.json(
        { error: 'Il parametro "email" è obbligatorio' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    // Sanity-check length before doing DNS lookup
    if (emailParam.length > 320) {
      return NextResponse.json(
        { error: 'L\'indirizzo email è troppo lungo (max 320 caratteri)' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const result = await validateEmail(emailParam)

    // Return 200 regardless of validity – the payload contains the validation outcome
    return NextResponse.json(result, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Cache-Control': 'no-store', // DNS results should not be cached at HTTP level
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto'
    console.error('[GET /api/external/validate-email]', message)
    return NextResponse.json(
      { error: message },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
