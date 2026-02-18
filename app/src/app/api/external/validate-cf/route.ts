import { NextRequest, NextResponse } from 'next/server'
import { validateCF } from '@/lib/external-api'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

/**
 * POST /api/external/validate-cf
 *
 * Body (JSON):
 *   { "codice_fiscale": "RSSMRA85M01H501Q" }
 *
 * Response:
 *   {
 *     valid: true,
 *     codiceFiscale: "RSSMRA85M01H501Q",
 *     normalized: "RSSMRA85M01H501Q",
 *     details: {
 *       lastName: "RSS",
 *       firstName: "MRA",
 *       birthYear: "85",
 *       birthMonth: "08",
 *       birthDay: "01",
 *       gender: "M",
 *       birthMunicipality: "H501",
 *       checkChar: "Q"
 *     }
 *   }
 */
export async function POST(request: NextRequest) {
  try {
    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Il corpo della richiesta deve essere un JSON valido' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Il corpo della richiesta deve essere un oggetto JSON' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const { codice_fiscale } = body as Record<string, unknown>

    if (!codice_fiscale) {
      return NextResponse.json(
        { error: 'Il campo "codice_fiscale" è obbligatorio' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    if (typeof codice_fiscale !== 'string') {
      return NextResponse.json(
        { error: 'Il campo "codice_fiscale" deve essere una stringa' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const result = validateCF(codice_fiscale)

    // Return 200 regardless of CF validity – the payload contains the validation outcome
    return NextResponse.json(result, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto'
    console.error('[POST /api/external/validate-cf]', message)
    return NextResponse.json(
      { error: message },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
