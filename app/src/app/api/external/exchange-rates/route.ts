import { NextRequest, NextResponse } from 'next/server'
import { getExchangeRates } from '@/lib/external-api'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Currencies supported by Frankfurter (as of 2025)
const VALID_CURRENCIES = new Set([
  'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP',
  'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MXN', 'MYR',
  'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'SEK', 'SGD', 'THB', 'TRY', 'USD',
  'ZAR',
])

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

/**
 * GET /api/external/exchange-rates
 *
 * Query params:
 *   base (optional) – currency code, default "EUR"
 *
 * Example: /api/external/exchange-rates?base=EUR
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const baseParam = (searchParams.get('base') ?? 'EUR').toUpperCase()

    if (!VALID_CURRENCIES.has(baseParam)) {
      return NextResponse.json(
        {
          error: `Valuta base non supportata: "${baseParam}". Valute supportate: ${[...VALID_CURRENCIES].join(', ')}`,
        },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const result = await getExchangeRates(baseParam)

    return NextResponse.json(result, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Cache-Control': 'public, max-age=3600', // 1h – matches service-level TTL
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto'
    console.error('[GET /api/external/exchange-rates]', message)
    return NextResponse.json(
      { error: message },
      { status: 502, headers: CORS_HEADERS }
    )
  }
}
