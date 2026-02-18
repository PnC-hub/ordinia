import dns from 'dns'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Holiday {
  date: string
  localName: string
  name: string
  countryCode: string
  fixed: boolean
  global: boolean
  counties: string[] | null
  launchYear: number | null
  types: string[]
}

export interface HolidaysResult {
  year: number
  countryCode: string
  holidays: Holiday[]
  cached: boolean
  fetchedAt: string
}

export interface ExchangeRates {
  amount: number
  base: string
  date: string
  rates: Record<string, number>
}

export interface ExchangeRatesResult {
  base: string
  date: string
  rates: Record<string, number>
  cached: boolean
  fetchedAt: string
}

export interface CFValidationResult {
  valid: boolean
  codiceFiscale: string
  normalized: string
  details: {
    lastName: string
    firstName: string
    birthYear: string
    birthMonth: string
    birthDay: string
    gender: 'M' | 'F'
    birthMunicipality: string
    checkChar: string
  } | null
  error?: string
}

export interface EmailValidationResult {
  email: string
  formatValid: boolean
  mxValid: boolean
  mxRecords: string[]
  valid: boolean
  error?: string
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

function createCache<T>() {
  const store = new Map<string, CacheEntry<T>>()

  function get(key: string): T | null {
    const entry = store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      store.delete(key)
      return null
    }
    return entry.data
  }

  function set(key: string, data: T, ttlMs: number): void {
    store.set(key, { data, expiresAt: Date.now() + ttlMs })
  }

  return { get, set }
}

// Separate caches per data type
const holidaysCache = createCache<HolidaysResult>()
const exchangeRatesCache = createCache<ExchangeRatesResult>()

// TTLs
const HOLIDAYS_TTL_MS = 24 * 60 * 60 * 1000  // 24 hours – public holidays rarely change
const EXCHANGE_RATES_TTL_MS = 60 * 60 * 1000  // 1 hour – rates update daily but we refresh often

// ─── getHolidays ──────────────────────────────────────────────────────────────

/**
 * Fetches public holidays for a given year and country from Nager.Date API.
 * Results are cached for 24 hours.
 */
export async function getHolidays(
  year: number,
  countryCode: string = 'IT'
): Promise<HolidaysResult> {
  const cacheKey = `${countryCode}-${year}`
  const cached = holidaysCache.get(cacheKey)
  if (cached) return { ...cached, cached: true }

  try {
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode.toUpperCase()}`
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 }, // disable Next.js fetch cache; we handle it manually
    })

    if (!response.ok) {
      throw new Error(`Nager.Date responded with ${response.status}: ${response.statusText}`)
    }

    const holidays: Holiday[] = await response.json()
    const fetchedAt = new Date().toISOString()

    const result: HolidaysResult = {
      year,
      countryCode: countryCode.toUpperCase(),
      holidays,
      cached: false,
      fetchedAt,
    }

    holidaysCache.set(cacheKey, result, HOLIDAYS_TTL_MS)
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to fetch holidays: ${message}`)
  }
}

// ─── getExchangeRates ─────────────────────────────────────────────────────────

/**
 * Fetches latest exchange rates from Frankfurter API.
 * Results are cached for 1 hour.
 */
export async function getExchangeRates(base: string = 'EUR'): Promise<ExchangeRatesResult> {
  const cacheKey = base.toUpperCase()
  const cached = exchangeRatesCache.get(cacheKey)
  if (cached) return { ...cached, cached: true }

  try {
    const url = `https://api.frankfurter.app/latest?base=${base.toUpperCase()}`
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      throw new Error(`Frankfurter responded with ${response.status}: ${response.statusText}`)
    }

    const data: ExchangeRates = await response.json()
    const fetchedAt = new Date().toISOString()

    const result: ExchangeRatesResult = {
      base: data.base,
      date: data.date,
      rates: data.rates,
      cached: false,
      fetchedAt,
    }

    exchangeRatesCache.set(cacheKey, result, EXCHANGE_RATES_TTL_MS)
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to fetch exchange rates: ${message}`)
  }
}

// ─── validateCF ───────────────────────────────────────────────────────────────

const CF_MONTH_CODES: Record<string, string> = {
  A: '01', B: '02', C: '03', D: '04', E: '05', H: '06',
  L: '07', M: '08', P: '09', R: '10', S: '11', T: '12',
}

const CF_ODD_VALUES: Record<string, number> = {
  '0': 1,  '1': 0,  '2': 5,  '3': 7,  '4': 9,  '5': 13,
  '6': 15, '7': 17, '8': 19, '9': 21,
  A: 1,  B: 0,  C: 5,  D: 7,  E: 9,  F: 13, G: 15, H: 17, I: 19, J: 21,
  K: 2,  L: 4,  M: 18, N: 20, O: 11, P: 3,  Q: 6,  R: 8,  S: 12, T: 14,
  U: 16, V: 10, W: 22, X: 25, Y: 24, Z: 23,
}

const CF_EVEN_VALUES: Record<string, number> = {
  '0': 0,  '1': 1,  '2': 2,  '3': 3,  '4': 4,  '5': 5,
  '6': 6,  '7': 7,  '8': 8,  '9': 9,
  A: 0,  B: 1,  C: 2,  D: 3,  E: 4,  F: 5,  G: 6,  H: 7,  I: 8,  J: 9,
  K: 10, L: 11, M: 12, N: 13, O: 14, P: 15, Q: 16, R: 17, S: 18, T: 19,
  U: 20, V: 21, W: 22, X: 23, Y: 24, Z: 25,
}

/**
 * Validates an Italian Codice Fiscale (tax code) using the official algorithm.
 * Pure local computation – no external calls.
 */
export function validateCF(codiceFiscale: string): CFValidationResult {
  const normalized = codiceFiscale.trim().toUpperCase()

  // Basic format check: 16 alphanumeric characters
  if (!/^[A-Z0-9]{16}$/.test(normalized)) {
    return {
      valid: false,
      codiceFiscale,
      normalized,
      details: null,
      error: 'Il Codice Fiscale deve essere composto da 16 caratteri alfanumerici',
    }
  }

  // Compute check character
  let sum = 0
  for (let i = 0; i < 15; i++) {
    const char = normalized[i]
    // Positions are 1-based in the spec; odd positions = index 0,2,4,...
    if ((i + 1) % 2 === 1) {
      sum += CF_ODD_VALUES[char] ?? 0
    } else {
      sum += CF_EVEN_VALUES[char] ?? 0
    }
  }

  const expectedCheckChar = String.fromCharCode(65 + (sum % 26)) // A=0 … Z=25
  const actualCheckChar = normalized[15]

  if (actualCheckChar !== expectedCheckChar) {
    return {
      valid: false,
      codiceFiscale,
      normalized,
      details: null,
      error: `Carattere di controllo non valido: atteso '${expectedCheckChar}', trovato '${actualCheckChar}'`,
    }
  }

  // Decode fields
  const lastNameCode = normalized.substring(0, 3)
  const firstNameCode = normalized.substring(3, 6)
  const birthYearCode = normalized.substring(6, 8)
  const birthMonthCode = normalized[8]
  const birthDayGenderCode = normalized.substring(9, 11)
  const municipalityCode = normalized.substring(11, 15)

  const birthDayNum = parseInt(birthDayGenderCode, 10)
  const gender: 'M' | 'F' = birthDayNum > 40 ? 'F' : 'M'
  const birthDay = gender === 'F'
    ? String(birthDayNum - 40).padStart(2, '0')
    : String(birthDayNum).padStart(2, '0')

  const birthMonth = CF_MONTH_CODES[birthMonthCode] ?? '??'

  return {
    valid: true,
    codiceFiscale,
    normalized,
    details: {
      lastName: lastNameCode,
      firstName: firstNameCode,
      birthYear: birthYearCode,
      birthMonth,
      birthDay,
      gender,
      birthMunicipality: municipalityCode,
      checkChar: actualCheckChar,
    },
  }
}

// ─── validateEmail ────────────────────────────────────────────────────────────

// RFC 5322 simplified regex – covers the vast majority of real-world addresses
const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates an email address by:
 * 1. Checking the format with a regex.
 * 2. Performing a DNS MX lookup on the domain.
 *
 * Uses Node.js `dns.promises` – works only in server-side Next.js code.
 */
export async function validateEmail(email: string): Promise<EmailValidationResult> {
  const trimmed = email.trim().toLowerCase()
  const formatValid = EMAIL_FORMAT_REGEX.test(trimmed)

  if (!formatValid) {
    return {
      email: trimmed,
      formatValid: false,
      mxValid: false,
      mxRecords: [],
      valid: false,
      error: 'Formato email non valido',
    }
  }

  const domain = trimmed.split('@')[1]

  try {
    const mxRecords = await dns.promises.resolveMx(domain)
    const mxHosts = mxRecords
      .sort((a, b) => a.priority - b.priority)
      .map((r) => r.exchange)

    const mxValid = mxHosts.length > 0

    return {
      email: trimmed,
      formatValid: true,
      mxValid,
      mxRecords: mxHosts,
      valid: formatValid && mxValid,
    }
  } catch (error) {
    // ENOTFOUND / ENODATA = domain has no MX records
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      email: trimmed,
      formatValid: true,
      mxValid: false,
      mxRecords: [],
      valid: false,
      error: `Nessun record MX trovato per il dominio '${domain}': ${message}`,
    }
  }
}
