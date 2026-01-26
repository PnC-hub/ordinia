'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface BrandingSettings {
  name: string
  logo: string | null
  primaryColor: string
  secondaryColor: string
  customDomain: string | null
}

export default function BrandingSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [settings, setSettings] = useState<BrandingSettings>({
    name: '',
    logo: null,
    primaryColor: '#2563eb',
    secondaryColor: '#10b981',
    customDomain: null
  })
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings/branding')
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
        setIsPremium(data.isPremium)
      }
    } catch {
      setError('Errore nel caricamento delle impostazioni')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/settings/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setSuccess('Impostazioni salvate con successo')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-gray-500">Caricamento...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/settings" className="text-blue-600 hover:underline text-sm">
          ← Torna alle impostazioni
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold mb-2">Personalizzazione Brand</h1>
        <p className="text-gray-600 mb-6">
          Personalizza l'aspetto del tuo portale HR
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Azienda
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Logo
            </label>
            <input
              type="url"
              value={settings.logo || ''}
              onChange={(e) => setSettings({ ...settings, logo: e.target.value || null })}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {settings.logo && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Anteprima:</p>
                <img src={settings.logo} alt="Logo preview" className="h-12 object-contain" />
              </div>
            )}
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colore Primario
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-12 h-12 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colore Secondario
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="w-12 h-12 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anteprima
            </label>
            <div
              className="p-6 rounded-lg border"
              style={{ backgroundColor: settings.primaryColor + '10' }}
            >
              <div className="flex items-center gap-4 mb-4">
                {settings.logo ? (
                  <img src={settings.logo} alt="Logo" className="h-8" />
                ) : (
                  <div
                    className="text-xl font-bold"
                    style={{ color: settings.primaryColor }}
                  >
                    {settings.name || 'Il tuo brand'}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Bottone Primario
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: settings.secondaryColor }}
                >
                  Bottone Secondario
                </button>
              </div>
            </div>
          </div>

          {/* Custom Domain - Premium Only */}
          <div className={!isPremium ? 'opacity-50' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dominio Personalizzato
              {!isPremium && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  Solo Piano Partner
                </span>
              )}
            </label>
            <input
              type="text"
              value={settings.customDomain || ''}
              onChange={(e) => setSettings({ ...settings, customDomain: e.target.value || null })}
              placeholder="hr.tuodominio.it"
              disabled={!isPremium}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            {isPremium && (
              <p className="mt-1 text-sm text-gray-500">
                Configura un CNAME dal tuo dominio a cname.geniushr.it
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            <Link
              href="/settings"
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>

      {/* Upgrade CTA for non-premium */}
      {!isPremium && (
        <div className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Sblocca il White-Label Completo</h3>
          <p className="text-purple-100 mb-4">
            Con il piano Partner puoi personalizzare completamente il portale:
            dominio personalizzato, logo, colori, e molto altro.
          </p>
          <Link
            href="/settings/billing"
            className="inline-block px-6 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50"
          >
            Upgrade a Partner
          </Link>
        </div>
      )}
    </div>
  )
}
