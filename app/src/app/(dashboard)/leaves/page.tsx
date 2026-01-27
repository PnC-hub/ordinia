'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface LeaveRequest {
  id: string
  type: string
  status: string
  startDate: string
  endDate: string
  days: number
  reason: string | null
  createdAt: string
  reviewedAt: string | null
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string
    department: string | null
  }
  reviewer: {
    id: string
    name: string
  } | null
}

interface LeaveBalance {
  employeeId: string
  employee: {
    firstName: string
    lastName: string
  }
  vacationDays: number
  vacationUsed: number
  vacationRemaining: number
  sickDays: number
  sickUsed: number
  permits: number
  permitsUsed: number
}

const typeLabels: Record<string, string> = {
  VACATION: 'Ferie',
  SICK: 'Malattia',
  PERMIT: 'Permesso',
  PARENTAL: 'Congedo Parentale',
  BEREAVEMENT: 'Lutto',
  WEDDING: 'Matrimonio',
  OTHER: 'Altro',
}

const typeColors: Record<string, string> = {
  VACATION: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  SICK: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  PERMIT: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  PARENTAL: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  BEREAVEMENT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  WEDDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  OTHER: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

const statusLabels: Record<string, string> = {
  PENDING: 'In attesa',
  APPROVED: 'Approvata',
  REJECTED: 'Rifiutata',
  CANCELLED: 'Annullata',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
}

export default function LeavesManagementPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [view, setView] = useState<'requests' | 'balances'>('requests')

  useEffect(() => {
    fetchData()
  }, [filter])

  async function fetchData() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter === 'pending') params.set('status', 'PENDING')
      if (filter === 'approved') params.set('status', 'APPROVED')

      const [requestsRes, balancesRes] = await Promise.all([
        fetch(`/api/leaves?${params}`),
        fetch('/api/leaves/balances'),
      ])

      if (requestsRes.ok) {
        const data = await requestsRes.json()
        setRequests(data)
      }
      if (balancesRes.ok) {
        const data = await balancesRes.json()
        setBalances(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(id: string) {
    try {
      const res = await fetch(`/api/leaves/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      if (!res.ok) throw new Error("Errore nell'approvazione")
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  async function handleReject(id: string) {
    const reason = prompt('Motivo del rifiuto:')
    if (!reason) return

    try {
      const res = await fetch(`/api/leaves/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason }),
      })
      if (!res.ok) throw new Error('Errore nel rifiuto')
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

  // Stats
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length
  const totalDaysRequested = requests
    .filter((r) => r.status === 'PENDING')
    .reduce((sum, r) => sum + r.days, 0)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ferie e Permessi
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestisci richieste ferie, permessi e saldi dipendenti
            </p>
          </div>
          <PageInfoTooltip
            title="Gestione Ferie e Permessi"
            description="Visualizza e gestisci tutte le richieste di assenza dei tuoi collaboratori. Approva o rifiuta le richieste e monitora i saldi residui."
            tips={[
              'Usa il filtro "Da Approvare" per le richieste urgenti',
              'Controlla i saldi prima di approvare lunghe assenze',
              'Il sistema calcola automaticamente i giorni lavorativi'
            ]}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('requests')}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === 'requests'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300'
            }`}
          >
            Richieste
          </button>
          <button
            onClick={() => setView('balances')}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === 'balances'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300'
            }`}
          >
            Saldi
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Totale Richieste
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {requests.length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Da Approvare</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Approvate</p>
          <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Giorni in Attesa
          </p>
          <p className="text-3xl font-bold text-blue-600">{totalDaysRequested}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {view === 'requests' && (
        <>
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
              Da Approvare ({pendingCount})
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

          {/* Table */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-zinc-900">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Dipendente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Periodo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Giorni
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Stato
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
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Nessuna richiesta trovata
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-gray-50 dark:hover:bg-zinc-750"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {req.employee.firstName} {req.employee.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {req.employee.department || req.employee.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              typeColors[req.type] || typeColors.OTHER
                            }`}
                          >
                            {typeLabels[req.type] || req.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <p className="text-gray-900 dark:text-white">
                            {formatDate(req.startDate)} - {formatDate(req.endDate)}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {req.days}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              statusColors[req.status] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {statusLabels[req.status] || req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {req.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApprove(req.id)}
                                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                                >
                                  Approva
                                </button>
                                <button
                                  onClick={() => handleReject(req.id)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  Rifiuta
                                </button>
                              </>
                            )}
                            <Link
                              href={`/leaves/${req.id}`}
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
        </>
      )}

      {view === 'balances' && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-900">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Dipendente
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Ferie Totali
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Ferie Usate
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Ferie Residue
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Permessi
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Permessi Usati
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
                ) : balances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Nessun saldo disponibile
                    </td>
                  </tr>
                ) : (
                  balances.map((bal) => (
                    <tr
                      key={bal.employeeId}
                      className="hover:bg-gray-50 dark:hover:bg-zinc-750"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {bal.employee.firstName} {bal.employee.lastName}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-900 dark:text-white">
                          {bal.vacationDays}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-red-600">{bal.vacationUsed}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-green-600">
                          {bal.vacationRemaining}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-900 dark:text-white">
                          {bal.permits}h
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-red-600">{bal.permitsUsed}h</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
