import { NextRequest, NextResponse } from 'next/server'
import { getHolidays } from '@/lib/external-api'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

/**
 * GET /api/external/holidays
 *
 * Query params:
 *   year    (required) – e.g. 2025
 *   country (optional) – ISO 3166-1 alpha-2 country code, default "IT"
 *
 * Example: /api/external/holidays?year=2025&country=IT
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const yearParam = searchParams.get('year')
    const countryParam = searchParams.get('country') ?? 'IT'

    // Validate year
    if (!yearParam) {
      return NextResponse.json(
        { error: 'Il parametro "year" è obbligatorio' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const year = parseInt(yearParam, 10)
    if (isNaN(year) || year < 1900 || year > 2100) {
      return NextResponse.json(
        { error: 'Il parametro "year" deve essere un anno valido (1900–2100)' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    // Validate country code (2 alphabetic characters)
    if (!/^[A-Za-z]{2}$/.test(countryParam)) {
      return NextResponse.json(
        { error: 'Il parametro "country" deve essere un codice ISO 3166-1 alpha-2 (es. IT, DE, FR)' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const result = await getHolidays(year, countryParam)

    return NextResponse.json(result, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Cache-Control': 'public, max-age=86400', // 24h – matches service-level TTL
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto'
    console.error('[GET /api/external/holidays]', message)
    return NextResponse.json(
      { error: message },
      { status: 502, headers: CORS_HEADERS } // 502 = upstream API failure
    )
  }
}
