'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const categoryOptions = [
  { value: 'FRAUD', label: 'Frode' },
  { value: 'CORRUPTION', label: 'Corruzione' },
  { value: 'SAFETY_VIOLATION', label: 'Violazioni sicurezza sul lavoro' },
  { value: 'ENVIRONMENTAL', label: 'Violazioni ambientali' },
  { value: 'DISCRIMINATION', label: 'Discriminazione' },
  { value: 'HARASSMENT', label: 'Molestie' },
  { value: 'DATA_BREACH', label: 'Violazione dati personali' },
  { value: 'CONFLICT_OF_INTEREST', label: 'Conflitto di interessi' },
  { value: 'FINANCIAL_IRREGULARITY', label: 'Irregolarità finanziarie' },
  { value: 'OTHER', label: 'Altro' },
]

export default function WhistleblowingReportPage() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accessCode, setAccessCode] = useState('')

  // Form state
  const [reporterType, setReporterType] = useState<'ANONYMOUS' | 'CONFIDENTIAL' | 'IDENTIFIED'>('ANONYMOUS')
  const [reporterName, setReporterName] = useState('')
  const [reporterEmail, setReporterEmail] = useState('')
  const [reporterPhone, setReporterPhone] = useState('')
  const [reporterRole, setReporterRole] = useState('')
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [personsInvolved, setPersonsInvolved] = useState('')
  const [evidence, setEvidence] = useState('')

  // Get tenantSlug from subdomain or query param
  const getTenantSlug = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      // Check for subdomain (e.g., company.geniushr.com)
      const parts = hostname.split('.')
      if (parts.length > 2) {
        return parts[0]
      }
      // Fallback to query param for development
      const params = new URLSearchParams(window.location.search)
      return params.get('tenant') || 'demo'
    }
    return 'demo'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!category || !title || !description) {
        setError('Categoria, titolo e descrizione sono obbligatori')
        setLoading(false)
        return
      }

      if (reporterType !== 'ANONYMOUS' && !reporterEmail) {
        setError('Email obbligatoria per segnalazioni non anonime')
        setLoading(false)
        return
      }

      const tenantSlug = getTenantSlug()

      const res = await fetch('/api/whistleblowing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug,
          reporterType,
          reporterName: reporterType !== 'ANONYMOUS' ? reporterName : null,
          reporterEmail: reporterType !== 'ANONYMOUS' ? reporterEmail : null,
          reporterPhone: reporterType !== 'ANONYMOUS' ? reporterPhone : null,
          reporterRole,
          category,
          title,
          description,
          personsInvolved,
          evidence,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Errore nell\'invio della segnalazione')
      }

      setAccessCode(data.accessCode)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Segnalazione Inviata
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              La tua segnalazione è stata ricevuta con successo. Conserva il seguente codice per seguire lo stato della pratica.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Codice di Tracciamento</p>
              <p className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                {accessCode}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(accessCode)}
                className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Copia codice
              </button>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                Importante:
              </p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-500 space-y-1">
                <li>• Conserva questo codice in modo sicuro</li>
                <li>• Riceverai conferma di ricezione entro 7 giorni</li>
                <li>• Feedback entro 3 mesi (D.Lgs. 24/2023)</li>
                <li>• La tua identità è protetta per legge</li>
              </ul>
            </div>

            <Link
              href="/whistleblowing/track"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Traccia Segnalazione
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Canale di Segnalazione Whistleblowing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Conforme al D.Lgs. 24/2023 - Protezione delle persone che segnalano violazioni
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
            Le tue segnalazioni sono protette
          </h2>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Riservatezza garantita per legge</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Divieto assoluto di ritorsioni</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Feedback garantito entro 3 mesi</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Canale sicuro e crittografato</span>
            </li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Reporter Type */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo di Segnalazione *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setReporterType('ANONYMOUS')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  reporterType === 'ANONYMOUS'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300'
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white mb-1">Anonima</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Identità completamente nascosta
                </div>
              </button>
              <button
                type="button"
                onClick={() => setReporterType('CONFIDENTIAL')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  reporterType === 'CONFIDENTIAL'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300'
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white mb-1">Riservata</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Identità nota solo al gestore
                </div>
              </button>
              <button
                type="button"
                onClick={() => setReporterType('IDENTIFIED')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  reporterType === 'IDENTIFIED'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300'
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white mb-1">Identificata</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Identità visibile
                </div>
              </button>
            </div>
          </div>

          {/* Personal Info (only if not anonymous) */}
          {reporterType !== 'ANONYMOUS' && (
            <div className="mb-8 p-6 bg-gray-50 dark:bg-zinc-900 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                Informazioni Segnalante
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome e Cognome
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ruolo in Azienda
                  </label>
                  <input
                    type="text"
                    value={reporterRole}
                    onChange={(e) => setReporterRole(e.target.value)}
                    placeholder="Es. Dipendente, Fornitore, Cliente"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoria Violazione *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
            >
              <option value="">Seleziona una categoria</option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titolo Segnalazione *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Breve descrizione del problema"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrizione Dettagliata *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              placeholder="Descrivi i fatti nel modo più dettagliato possibile (cosa, quando, dove, chi)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Persons Involved */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Persone Coinvolte
            </label>
            <textarea
              value={personsInvolved}
              onChange={(e) => setPersonsInvolved(e.target.value)}
              rows={3}
              placeholder="Nomi o ruoli delle persone coinvolte"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Evidence */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prove o Documenti
            </label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={3}
              placeholder="Descrivi eventuali prove, documenti o informazioni utili all'indagine"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Nota: L'upload di file sarà disponibile dopo l'invio, tramite il codice di tracciamento
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Ai sensi del D.Lgs. 24/2023, i dati forniti saranno trattati esclusivamente per la gestione della segnalazione
              e saranno conservati per 5 anni. L'identità del segnalante è protetta e non può essere rivelata senza consenso
              esplicito, salvo obblighi di legge. È vietata qualsiasi forma di ritorsione.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              {loading ? 'Invio in corso...' : 'Invia Segnalazione'}
            </button>
            <Link
              href="/whistleblowing/track"
              className="px-6 py-3 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
            >
              Traccia Segnalazione
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
