'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('STARTER')

  const plans = [
    { id: 'STARTER', name: 'Starter', price: '€29', period: '/mese', employees: 'fino a 5 dipendenti' },
    { id: 'PROFESSIONAL', name: 'Professional', price: '€59', period: '/mese', employees: 'fino a 15 dipendenti', popular: true },
    { id: 'ENTERPRISE', name: 'Enterprise', price: '€99', period: '/mese', employees: 'dipendenti illimitati' }
  ]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      studioName: formData.get('studioName'),
      ownerName: formData.get('ownerName'),
      email: formData.get('email'),
      password: formData.get('password'),
      plan: selectedPlan
    }

    try {
      const res = await fetch('/api/tenants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Errore durante la registrazione')
      }

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else if (result.portalUrl) {
        router.push(result.portalUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold">
            <span className="text-blue-600">Genius</span>
            <span className="text-green-500">HR</span>
          </Link>
          <p className="mt-2 text-gray-600">Inizia la tua prova gratuita di 14 giorni</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Form */}
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">Crea il tuo account</h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="studioName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Studio
                  </label>
                  <input
                    type="text"
                    id="studioName"
                    name="studioName"
                    required
                    placeholder="Studio Dentistico Rossi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome e Cognome
                  </label>
                  <input
                    type="text"
                    id="ownerName"
                    name="ownerName"
                    required
                    placeholder="Mario Rossi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="mario@studiorossi.it"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    minLength={8}
                    placeholder="Minimo 8 caratteri"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Registrazione in corso...' : 'Inizia Prova Gratuita'}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Hai gia un account?{' '}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Accedi
                  </Link>
                </p>
              </form>
            </div>

            {/* Plan Selection */}
            <div className="bg-gray-50 p-8 border-l border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Scegli il tuo piano</h3>
              <p className="text-sm text-gray-500 mb-6">14 giorni gratis, poi:</p>

              <div className="space-y-3">
                {plans.map((plan) => (
                  <label
                    key={plan.id}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={selectedPlan === plan.id}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{plan.name}</span>
                          {plan.popular && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                              Popolare
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{plan.employees}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold">{plan.price}</span>
                        <span className="text-gray-400">{plan.period}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  <span className="font-semibold">Prova gratuita 14 giorni</span><br />
                  Nessuna carta richiesta. Disdici quando vuoi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
