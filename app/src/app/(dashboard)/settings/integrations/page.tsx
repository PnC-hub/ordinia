'use client'

import { useEffect, useState } from 'react'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface Integration {
  id: string
  name: string
  type: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string | null
  config: Record<string, unknown>
}

const integrationTypes = [
  {
    id: 'google',
    name: 'Google Workspace',
    description: 'Sincronizza con Google Calendar e Google Drive',
    icon: '🔵',
    features: ['Calendario ferie', 'Archiviazione documenti', 'Single Sign-On'],
  },
  {
    id: 'microsoft',
    name: 'Microsoft 365',
    description: 'Integrazione con Outlook e OneDrive',
    icon: '🟦',
    features: ['Calendario ferie', 'Archiviazione documenti', 'Teams'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Notifiche e promemoria su Slack',
    icon: '💬',
    features: ['Notifiche approvazioni', 'Promemoria scadenze', 'Bot HR'],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Notifiche via WhatsApp ai dipendenti',
    icon: '📱',
    features: ['Notifiche buste paga', 'Solleciti firma', 'Comunicazioni HR'],
  },
  {
    id: 'zucchetti',
    name: 'Zucchetti',
    description: 'Integrazione con software paghe Zucchetti',
    icon: '📊',
    features: ['Import buste paga', 'Anagrafiche dipendenti', 'Presenze'],
  },
  {
    id: 'teamsystem',
    name: 'TeamSystem',
    description: 'Integrazione con TeamSystem HR',
    icon: '🏢',
    features: ['Sincronizzazione dati', 'Cedolini automatici', 'Anagrafiche'],
  },
  {
    id: 'docusign',
    name: 'DocuSign',
    description: 'Firma elettronica avanzata',
    icon: '✍️',
    features: ['Firma documenti', 'Validità legale', 'Audit trail'],
  },
  {
    id: 'aws_s3',
    name: 'Amazon S3',
    description: 'Storage documenti su cloud AWS',
    icon: '☁️',
    features: ['Backup automatici', 'Storage illimitato', 'Crittografia'],
  },
]

const statusLabels: Record<string, string> = {
  connected: 'Connesso',
  disconnected: 'Non connesso',
  error: 'Errore',
}

const statusColors: Record<string, string> = {
  connected: 'bg-green-100 text-green-700',
  disconnected: 'bg-gray-100 text-gray-700',
  error: 'bg-red-100 text-red-700',
}

export default function IntegrationsSettingsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedType, setSelectedType] = useState<typeof integrationTypes[0] | null>(null)

  // Config form
  const [configApiKey, setConfigApiKey] = useState('')
  const [configWebhook, setConfigWebhook] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  async function fetchIntegrations() {
    try {
      setLoading(true)
      const res = await fetch('/api/integrations')
      if (res.ok) {
        const data = await res.json()
        setIntegrations(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect(type: typeof integrationTypes[0]) {
    setSelectedType(type)
    setShowConfigModal(true)
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedType) return

    try {
      setSaving(true)
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType.id,
          config: {
            apiKey: configApiKey,
            webhookUrl: configWebhook,
          },
        }),
      })

      if (!res.ok) throw new Error('Errore nella configurazione')

      setShowConfigModal(false)
      setSelectedType(null)
      setConfigApiKey('')
      setConfigWebhook('')
      fetchIntegrations()
      alert('Integrazione configurata!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    } finally {
      setSaving(false)
    }
  }

  async function handleDisconnect(id: string) {
    if (!confirm('Sei sicuro di voler disconnettere questa integrazione?')) return

    try {
      const res = await fetch(`/api/integrations/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Errore nella disconnessione')
      fetchIntegrations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  async function handleSync(id: string) {
    try {
      const res = await fetch(`/api/integrations/${id}/sync`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Errore nella sincronizzazione')
      fetchIntegrations()
      alert('Sincronizzazione avviata!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Mai'
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  const getIntegrationStatus = (type: string): Integration | undefined => {
    return integrations.find((i) => i.type === type)
  }

  // Stats
  const connectedCount = integrations.filter((i) => i.status === 'connected').length

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Integrazioni
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connetti GeniusHR con i tuoi strumenti preferiti
          </p>
        </div>
        <PageInfoTooltip
          title="Integrazioni Esterne"
          description="Collega GeniusHR ai software che già utilizzi per automatizzare lo scambio di dati. Le integrazioni permettono di sincronizzare anagrafiche, presenze e cedolini."
          tips={[
            'L\'integrazione con Zucchetti e TeamSystem sincronizza i dati paghe',
            'Google e Microsoft 365 permettono SSO e calendario condiviso',
            'Le notifiche WhatsApp richiedono l\'account Business API'
          ]}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Integrazioni Disponibili
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {integrationTypes.length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Connesse</p>
          <p className="text-3xl font-bold text-green-600">{connectedCount}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Da Configurare</p>
          <p className="text-3xl font-bold text-blue-600">
            {integrationTypes.length - connectedCount}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {/* Integrations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrationTypes.map((type) => {
          const integration = getIntegrationStatus(type.id)
          const isConnected = integration?.status === 'connected'

          return (
            <div
              key={type.id}
              className={`bg-white dark:bg-zinc-800 rounded-xl p-5 border ${
                isConnected
                  ? 'border-green-200 dark:border-green-800'
                  : 'border-gray-200 dark:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {type.name}
                    </h3>
                    {integration && (
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          statusColors[integration.status]
                        }`}
                      >
                        {statusLabels[integration.status]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {type.description}
              </p>

              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Funzionalità:
                </p>
                <div className="flex flex-wrap gap-1">
                  {type.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {integration?.lastSync && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Ultima sincronizzazione: {formatDate(integration.lastSync)}
                </p>
              )}

              <div className="flex gap-2">
                {isConnected ? (
                  <>
                    <button
                      onClick={() => handleSync(integration!.id)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Sincronizza
                    </button>
                    <button
                      onClick={() => handleDisconnect(integration!.id)}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700"
                    >
                      Disconnetti
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(type)}
                    className="w-full px-3 py-2 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100"
                  >
                    Connetti
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Config Modal */}
      {showConfigModal && selectedType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{selectedType.icon}</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Configura {selectedType.name}
              </h2>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  API Key / Client ID
                </label>
                <input
                  type="text"
                  value={configApiKey}
                  onChange={(e) => setConfigApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  placeholder="Inserisci la chiave API"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Webhook URL (opzionale)
                </label>
                <input
                  type="url"
                  value={configWebhook}
                  onChange={(e) => setConfigWebhook(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  placeholder="https://..."
                />
              </div>

              <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Per ottenere le credenziali API, accedi al pannello sviluppatori di{' '}
                  {selectedType.name} e crea una nuova applicazione.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfigModal(false)
                    setSelectedType(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Salvataggio...' : 'Connetti'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
