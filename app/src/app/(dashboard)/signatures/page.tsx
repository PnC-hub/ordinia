'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface SignatureRequest {
  id: string
  status: string
  priority: string
  dueDate: string | null
  requestedAt: string
  signedAt: string | null
  document: {
    id: string
    name: string
    type: string
  }
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string
    department: string | null
  }
  requester: {
    id: string
    name: string
  }
}

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  NORMAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

const priorityLabels: Record<string, string> = {
  URGENT: 'Urgente',
  HIGH: 'Alta',
  NORMAL: 'Normale',
  LOW: 'Bassa',
}

const statusLabels: Record<string, string> = {
  PENDING: 'In attesa',
  VIEWED: 'Visualizzato',
  SIGNED: 'Firmato',
  REJECTED: 'Rifiutato',
  EXPIRED: 'Scaduto',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  VIEWED: 'bg-blue-100 text-blue-700',
  SIGNED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-gray-100 text-gray-700',
}

export default function SignaturesManagementPage() {
  const [signatures, setSignatures] = useState<SignatureRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'signed'>('all')
  const [showNewModal, setShowNewModal] = useState(false)

  useEffect(() => {
    fetchSignatures()
  }, [filter])

  async function fetchSignatures() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter === 'pending') params.set('status', 'PENDING')
      if (filter === 'signed') params.set('status', 'SIGNED')

      const res = await fetch(`/api/signatures?${params}`)
      if (!res.ok) throw new Error('Errore nel caricamento')
      const data = await res.json()
      setSignatures(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend(id: string) {
    try {
      const res = await fetch(`/api/signatures/${id}/remind`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Errore nell\'invio')
      alert('Promemoria inviato!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Sei sicuro di voler annullare questa richiesta?')) return

    try {
      const res = await fetch(`/api/signatures/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Errore nell\'annullamento')
      fetchSignatures()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  // Stats
  const pendingCount = signatures.filter((s) => s.status === 'PENDING').length
  const signedCount = signatures.filter((s) => s.status === 'SIGNED').length
  const overdueCount = signatures.filter(
    (s) => s.status === 'PENDING' && isOverdue(s.dueDate)
  ).length

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestione Firme
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Invia documenti da firmare e monitora lo stato
            </p>
          </div>
          <PageInfoTooltip
            title="Firma Elettronica"
            description="Invia documenti ai dipendenti per la firma digitale. Traccia lo stato di ogni richiesta e invia solleciti automatici per le firme in scadenza."
            tips={[
              'Imposta una scadenza per ricevere solleciti automatici',
              'La firma elettronica ha validità legale ai sensi del CAD',
              'Puoi inviare promemoria manuali per le firme urgenti'
            ]}
          />
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Richiedi Firma
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Totale</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {signatures.length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Attesa</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Firmati</p>
          <p className="text-3xl font-bold text-green-600">{signedCount}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Scaduti</p>
          <p className="text-3xl font-bold text-red-600">{overdueCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300'
          }`}
        >
          Tutti
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300'
          }`}
        >
          In Attesa ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('signed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'signed'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300'
          }`}
        >
          Firmati
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-900">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Dipendente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Priorità
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Scadenza
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Caricamento...
                  </td>
                </tr>
              ) : signatures.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nessuna richiesta di firma trovata
                  </td>
                </tr>
              ) : (
                signatures.map((sig) => (
                  <tr
                    key={sig.id}
                    className={`hover:bg-gray-50 dark:hover:bg-zinc-750 ${
                      sig.status === 'PENDING' && isOverdue(sig.dueDate)
                        ? 'bg-red-50 dark:bg-red-900/10'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400">📄</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {sig.document.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Richiesto il {formatDate(sig.requestedAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {sig.employee.firstName} {sig.employee.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {sig.employee.department || sig.employee.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          priorityColors[sig.priority]
                        }`}
                      >
                        {priorityLabels[sig.priority]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          statusColors[sig.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusLabels[sig.status] || sig.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {sig.dueDate ? (
                        <span
                          className={
                            isOverdue(sig.dueDate)
                              ? 'text-red-600 font-medium'
                              : 'text-gray-500 dark:text-gray-400'
                          }
                        >
                          {formatDate(sig.dueDate).split(',')[0]}
                          {isOverdue(sig.dueDate) && ' (scaduto!)'}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {sig.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleResend(sig.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Sollecita
                            </button>
                            <button
                              onClick={() => handleCancel(sig.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Annulla
                            </button>
                          </>
                        )}
                        {sig.status === 'SIGNED' && (
                          <Link
                            href={`/signatures/${sig.id}`}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Vedi Firma
                          </Link>
                        )}
                        <Link
                          href={`/signatures/${sig.id}`}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Dettagli
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
