'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface LeaveRequest {
  id: string
  type: string
  startDate: string
  endDate: string
  totalDays: number
  halfDay: boolean
  reason: string | null
  status: string
  managerNotes: string | null
  createdAt: string
  approvedByUser: {
    id: string
    name: string
  } | null
}

interface LeaveBalance {
  type: string
  totalDays: number
  usedDays: number
  pendingDays: number
  carriedOver: number
}

const typeLabels: Record<string, string> = {
  VACATION: 'Ferie',
  SICK: 'Malattia',
  PERSONAL: 'Permesso personale',
  PARENTAL: 'Congedo parentale',
  BEREAVEMENT: 'Lutto',
  STUDY: 'Permesso studio',
  WEDDING: 'Congedo matrimoniale',
  OTHER: 'Altro',
}

const statusLabels: Record<string, string> = {
  PENDING: 'In attesa',
  APPROVED: 'Approvato',
  REJECTED: 'Rifiutato',
  CANCELLED: 'Annullato',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
}

export default function EmployeeLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [showNewForm, setShowNewForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'VACATION',
    startDate: '',
    endDate: '',
    halfDay: false,
    reason: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [filter])

  async function fetchData() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.set('status', filter.toUpperCase())
      }

      const [leavesRes, balancesRes] = await Promise.all([
        fetch(`/api/leaves?${params}`),
        fetch('/api/leaves/balance'),
      ])

      if (leavesRes.ok) {
        const data = await leavesRes.json()
        setLeaves(data)
      }

      if (balancesRes.ok) {
        const data = await balancesRes.json()
        setBalances(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Errore nell\'invio')
      }

      setShowNewForm(false)
      setFormData({
        type: 'VACATION',
        startDate: '',
        endDate: '',
        halfDay: false,
        reason: '',
      })
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'invio')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Sei sicuro di voler annullare questa richiesta?')) return

    try {
      const res = await fetch(`/api/leaves/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Errore nell\'annullamento')
      }
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ferie e Permessi</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestisci le tue richieste di assenza</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuova Richiesta
        </button>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {balances.map((balance) => {
          const available = balance.totalDays + balance.carriedOver - balance.usedDays - balance.pendingDays
          return (
            <div
              key={balance.type}
              className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">{typeLabels[balance.type] || balance.type}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{available}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Usati: {balance.usedDays} | In attesa: {balance.pendingDays}
              </p>
            </div>
          )
        })}
        {balances.length === 0 && !loading && (
          <div className="col-span-full bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 text-center text-gray-500">
            Saldi non ancora configurati
          </div>
        )}
      </div>

      {/* New Request Form */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Nuova Richiesta</h2>
              <button
                onClick={() => setShowNewForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Inizio
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Fine
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    min={formData.startDate}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="halfDay"
                  checked={formData.halfDay}
                  onChange={(e) => setFormData({ ...formData, halfDay: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="halfDay" className="text-sm text-gray-700 dark:text-gray-300">
                  Mezza giornata
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motivazione (opzionale)
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                />
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Invio...' : 'Invia Richiesta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          Tutte
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300'
          }`}
        >
          In attesa
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300'
          }`}
        >
          Approvate
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl p-6">
                <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : leaves.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-12 text-center">
            <span className="text-6xl mb-4 block">🏖️</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nessuna richiesta trovata
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Non hai ancora effettuato richieste di ferie o permessi
            </p>
            <button
              onClick={() => setShowNewForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Crea la prima richiesta
            </button>
          </div>
        ) : (
          leaves.map((leave) => (
            <div
              key={leave.id}
              className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {typeLabels[leave.type] || leave.type}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[leave.status]}`}>
                      {statusLabels[leave.status]}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDate(leave.startDate)}
                    {leave.startDate !== leave.endDate && ` - ${formatDate(leave.endDate)}`}
                    {leave.halfDay && ' (mezza giornata)'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {leave.totalDays} {leave.totalDays === 1 ? 'giorno' : 'giorni'}
                    {leave.reason && ` - ${leave.reason}`}
                  </p>
                  {leave.managerNotes && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      Note responsabile: {leave.managerNotes}
                    </p>
                  )}
                </div>
                {leave.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancel(leave.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Annulla
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
