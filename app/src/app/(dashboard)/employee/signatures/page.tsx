'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface SignatureRequest {
  id: string
  status: string
  priority: string
  dueDate: string | null
  message: string | null
  createdAt: string
  document: {
    id: string
    name: string
    type: string
  }
  requestedByUser: {
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

export default function EmployeeSignaturesPage() {
  const [signatures, setSignatures] = useState<SignatureRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'signed'>('pending')

  useEffect(() => {
    fetchSignatures()
  }, [filter])

  async function fetchSignatures() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter === 'pending') {
        params.set('status', 'PENDING')
      } else if (filter === 'signed') {
        params.set('status', 'SIGNED')
      }

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

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'medium',
    }).format(new Date(dateStr))
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const pendingCount = signatures.filter(s => s.status === 'PENDING').length

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Documenti da Firmare
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualizza e firma i documenti richiesti
        </p>
      </div>

      {/* Alert for pending signatures */}
      {pendingCount > 0 && filter === 'all' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-amber-600 text-2xl">⚠️</span>
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Hai {pendingCount} documento/i in attesa di firma
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Controlla i documenti urgenti e firmali prima possibile
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300'
          }`}
        >
          Da firmare ({signatures.filter(s => s.status === 'PENDING').length})
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
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : signatures.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-12 text-center">
          <span className="text-6xl mb-4 block">✨</span>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {filter === 'pending' ? 'Nessun documento da firmare!' : 'Nessun documento trovato'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'pending'
              ? 'Ottimo lavoro! Non ci sono documenti in attesa della tua firma.'
              : 'Non sono stati trovati documenti per questa categoria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {signatures.map((signature) => (
            <div
              key={signature.id}
              className={`bg-white dark:bg-zinc-800 rounded-xl border p-6 ${
                signature.status === 'PENDING' && isOverdue(signature.dueDate)
                  ? 'border-red-300 dark:border-red-800'
                  : 'border-gray-200 dark:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {signature.document.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Richiesto da {signature.requestedByUser.name} il {formatDate(signature.createdAt)}
                    </p>
                    {signature.message && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-zinc-700 p-2 rounded">
                        &ldquo;{signature.message}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[signature.priority]}`}>
                        {priorityLabels[signature.priority]}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[signature.status]}`}>
                        {statusLabels[signature.status]}
                      </span>
                      {signature.dueDate && (
                        <span className={`text-xs ${isOverdue(signature.dueDate) ? 'text-red-600 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                          Scadenza: {formatDate(signature.dueDate)}
                          {isOverdue(signature.dueDate) && ' (scaduto!)'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {signature.status === 'PENDING' && (
                    <Link
                      href={`/employee/signatures/${signature.id}/sign`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Firma ora
                    </Link>
                  )}
                  <Link
                    href={`/employee/signatures/${signature.id}`}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors dark:bg-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-600"
                  >
                    Dettagli
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
