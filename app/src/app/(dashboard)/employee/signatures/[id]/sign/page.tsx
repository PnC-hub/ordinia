'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface SignatureRequest {
  id: string
  status: string
  document: {
    id: string
    name: string
    type: string
    fileUrl: string | null
    content: string | null
  }
  requestedByUser: {
    name: string
  }
}

type SigningStep = 'view' | 'verify-password' | 'verify-otp' | 'confirm-phrase' | 'complete'

export default function SignDocumentPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [request, setRequest] = useState<SignatureRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [step, setStep] = useState<SigningStep>('view')

  // Document viewing tracking
  const [scrollPercentage, setScrollPercentage] = useState(0)
  const [timeOnDocument, setTimeOnDocument] = useState(0)
  const [hasReadDocument, setHasReadDocument] = useState(false)
  const documentRef = useRef<HTMLDivElement>(null)
  const startTimeRef = useRef<number>(Date.now())

  // Verification states
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordVerified, setPasswordVerified] = useState(false)

  const [otpMethod, setOtpMethod] = useState<'email' | 'totp'>('email')
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)

  const [confirmationPhrase, setConfirmationPhrase] = useState('')
  const [phraseError, setPhraseError] = useState('')

  const [signing, setSigning] = useState(false)
  const [geoLocation, setGeoLocation] = useState<{ lat: number; lng: number } | null>(null)

  const REQUIRED_PHRASE = 'Confermo di aver letto e compreso il documento'

  useEffect(() => {
    fetchSignatureRequest()
    // Get geolocation on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGeoLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // Ignore errors, geolocation is optional
      )
    }
  }, [id])

  // Track time on document
  useEffect(() => {
    if (step === 'view') {
      const interval = setInterval(() => {
        setTimeOnDocument(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [step])

  // Track scroll
  useEffect(() => {
    const handleScroll = () => {
      if (documentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = documentRef.current
        const percentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
        setScrollPercentage(Math.max(scrollPercentage, percentage || 0))

        // Mark as read when scrolled to 90%
        if (percentage >= 90) {
          setHasReadDocument(true)
        }
      }
    }

    const docElement = documentRef.current
    if (docElement) {
      docElement.addEventListener('scroll', handleScroll)
      return () => docElement.removeEventListener('scroll', handleScroll)
    }
  }, [scrollPercentage])

  async function fetchSignatureRequest() {
    try {
      const res = await fetch(`/api/signatures/${id}`)
      if (!res.ok) throw new Error('Errore nel caricamento')
      const data = await res.json()
      setRequest(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyPassword() {
    setPasswordError('')
    try {
      const res = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Password non corretta')
      }

      setPasswordVerified(true)
      setStep('verify-otp')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Errore')
    }
  }

  async function handleSendOtp() {
    setSendingOtp(true)
    setOtpError('')
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: 'signature',
          referenceId: id,
          method: otpMethod,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Errore invio OTP')
      }

      setOtpSent(true)
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Errore')
    } finally {
      setSendingOtp(false)
    }
  }

  async function handleVerifyOtp() {
    setOtpError('')
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: otpCode,
          purpose: 'signature',
          referenceId: id,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Codice non valido')
      }

      setOtpVerified(true)
      setStep('confirm-phrase')
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Errore')
    }
  }

  async function handleSign() {
    setPhraseError('')

    // Validate phrase
    if (confirmationPhrase.trim().toLowerCase() !== REQUIRED_PHRASE.toLowerCase()) {
      setPhraseError('La frase inserita non corrisponde. Riprova.')
      return
    }

    setSigning(true)
    try {
      const res = await fetch(`/api/signatures/${id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passwordVerified: true,
          otpVerified: true,
          confirmationPhrase: confirmationPhrase.trim(),
          scrollPercentage,
          timeOnDocument,
          geoLocation,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Errore nella firma')
      }

      setStep('complete')
    } catch (err) {
      setPhraseError(err instanceof Error ? err.message : 'Errore')
    } finally {
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-500">Caricamento documento...</div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error || 'Documento non trovato'}
        </div>
      </div>
    )
  }

  if (request.status !== 'PENDING') {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
          Questo documento è già stato firmato o non è più disponibile per la firma.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      {/* Progress Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Firma Documento
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {request.document.name}
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {['view', 'verify-password', 'verify-otp', 'confirm-phrase'].map((s, i) => {
              const steps = ['view', 'verify-password', 'verify-otp', 'confirm-phrase']
              const currentIndex = steps.indexOf(step)
              const isComplete = i < currentIndex || step === 'complete'
              const isCurrent = s === step

              return (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isComplete
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isComplete ? '✓' : i + 1}
                  </div>
                  {i < 3 && (
                    <div
                      className={`w-12 h-1 ${
                        isComplete ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Leggi</span>
            <span>Password</span>
            <span>OTP</span>
            <span>Conferma</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Step 1: View Document */}
        {step === 'view' && (
          <div>
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 mb-6">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Contenuto del Documento
                </h2>
                <div className="text-sm text-gray-500">
                  Tempo: {Math.floor(timeOnDocument / 60)}:{(timeOnDocument % 60).toString().padStart(2, '0')} |
                  Letto: {scrollPercentage}%
                </div>
              </div>
              <div
                ref={documentRef}
                className="p-6 max-h-[60vh] overflow-y-auto prose dark:prose-invert max-w-none"
              >
                {request.document.content ? (
                  <div dangerouslySetInnerHTML={{ __html: request.document.content }} />
                ) : request.document.fileUrl ? (
                  <iframe
                    src={request.document.fileUrl}
                    className="w-full h-[50vh] border-0"
                    title="Documento"
                  />
                ) : (
                  <p className="text-gray-500">Contenuto non disponibile</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Attenzione:</strong> Leggere attentamente il documento prima di procedere.
                Scorri fino alla fine per abilitare il pulsante di firma.
              </p>
            </div>

            <button
              onClick={() => setStep('verify-password')}
              disabled={!hasReadDocument && timeOnDocument < 30}
              className={`w-full py-4 rounded-lg font-semibold transition-colors ${
                hasReadDocument || timeOnDocument >= 30
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {hasReadDocument || timeOnDocument >= 30
                ? 'Procedi alla Firma'
                : `Leggi il documento (${Math.max(0, 30 - timeOnDocument)}s)`}
            </button>
          </div>
        )}

        {/* Step 2: Verify Password */}
        {step === 'verify-password' && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Verifica Password
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Per procedere, inserisci la tua password di accesso
              </p>
            </div>

            <div className="max-w-sm mx-auto">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="La tua password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white text-center text-lg"
                autoFocus
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-2 text-center">{passwordError}</p>
              )}

              <button
                onClick={handleVerifyPassword}
                disabled={!password}
                className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verifica Password
              </button>

              <button
                onClick={() => setStep('view')}
                className="w-full mt-2 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Torna al documento
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Verify OTP */}
        {step === 'verify-otp' && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Verifica OTP
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Scegli come ricevere il codice di verifica
              </p>
            </div>

            <div className="max-w-sm mx-auto">
              {!otpSent ? (
                <>
                  <div className="space-y-3 mb-6">
                    <button
                      onClick={() => setOtpMethod('email')}
                      className={`w-full p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                        otpMethod === 'email'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-zinc-600 hover:border-purple-300'
                      }`}
                    >
                      <span className="text-2xl">📧</span>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">Email</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Ricevi codice via email
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => setOtpMethod('totp')}
                      className={`w-full p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                        otpMethod === 'totp'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-zinc-600 hover:border-purple-300'
                      }`}
                    >
                      <span className="text-2xl">📲</span>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Google Authenticator
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Usa app TOTP (se configurata)
                        </p>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
                  >
                    {sendingOtp ? 'Invio in corso...' : 'Invia Codice'}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      {otpMethod === 'email'
                        ? 'Codice inviato alla tua email'
                        : 'Inserisci il codice dalla tua app'}
                    </p>
                  </div>

                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-4 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest font-mono"
                    autoFocus
                  />
                  {otpError && (
                    <p className="text-red-600 text-sm mt-2 text-center">{otpError}</p>
                  )}

                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpCode.length !== 6}
                    className="w-full mt-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verifica Codice
                  </button>

                  <button
                    onClick={() => {
                      setOtpSent(false)
                      setOtpCode('')
                    }}
                    className="w-full mt-2 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800"
                  >
                    Invia nuovo codice
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Confirm Phrase */}
        {step === 'confirm-phrase' && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✍️</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Conferma Firma
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Per completare la firma, digita la seguente frase:
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <div className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-4 mb-4 text-center">
                <p className="text-lg font-medium text-gray-900 dark:text-white italic">
                  &ldquo;{REQUIRED_PHRASE}&rdquo;
                </p>
              </div>

              <textarea
                value={confirmationPhrase}
                onChange={(e) => setConfirmationPhrase(e.target.value)}
                placeholder="Digita la frase qui..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                autoFocus
              />
              {phraseError && (
                <p className="text-red-600 text-sm mt-2">{phraseError}</p>
              )}

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Riepilogo Firma
                </h3>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>✓ Password verificata</li>
                  <li>✓ OTP verificato</li>
                  <li>✓ Documento letto ({scrollPercentage}%)</li>
                  <li>✓ Tempo lettura: {Math.floor(timeOnDocument / 60)}:{(timeOnDocument % 60).toString().padStart(2, '0')}</li>
                  {geoLocation && <li>✓ Posizione rilevata</li>}
                </ul>
              </div>

              <button
                onClick={handleSign}
                disabled={signing || !confirmationPhrase.trim()}
                className="w-full mt-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signing ? 'Firma in corso...' : 'Firma Documento'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === 'complete' && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Documento Firmato!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              La tua firma elettronica è stata registrata con successo.
              Una copia del documento firmato ti sarà inviata via email.
            </p>

            <div className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Dettagli Firma</h3>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p>Documento: {request.document.name}</p>
                <p>Data/Ora: {new Date().toLocaleString('it-IT')}</p>
                <p>Verifica: Password + OTP + Frase</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/employee/signatures')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Torna ai Documenti
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
