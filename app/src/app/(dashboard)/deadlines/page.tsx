'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface Deadline {
  id: string
  title: string
  description: string | null
  type: string
  dueDate: string
  status: string
  completedAt: string | null
  employee: {
    id: string
    firstName: string
    lastName: string
    department: string | null
  } | null
}

const typeLabels: Record<string, string> = {
  TRAINING_EXPIRY: 'Scadenza Formazione',
  MEDICAL_VISIT: 'Visita Medica',
  DPI_RENEWAL: 'Rinnovo DPI',
  CONTRACT_EXPIRY: 'Scadenza Contratto',
  PROBATION_END: 'Fine Prova',
  DOCUMENT_EXPIRY: 'Scadenza Documento',
  CUSTOM: 'Personalizzata',
}

const typeColors: Record<string, string> = {
  TRAINING_EXPIRY: 'bg-green-100 text-green-700',
  MEDICAL_VISIT: 'bg-red-100 text-red-700',
  DPI_RENEWAL: 'bg-orange-100 text-orange-700',
  CONTRACT_EXPIRY: 'bg-blue-100 text-blue-700',
  PROBATION_END: 'bg-purple-100 text-purple-700',
  DOCUMENT_EXPIRY: 'bg-yellow-100 text-yellow-700',
  CUSTOM: 'bg-gray-100 text-gray-700',
}

const statusLabels: Record<string, string> = {
  PENDING: 'In attesa',
  UPCOMING: 'In arrivo',
  OVERDUE: 'Scaduta',
  COMPLETED: 'Completata',
  DISMISSED: 'Annullata',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  UPCOMING: 'bg-amber-100 text-amber-700',
  OVERDUE: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-green-100 text-green-700',
  DISMISSED: 'bg-gray-100 text-gray-500',
}

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    async function fetchDeadlines() {
      try {
        const params = new URLSearchParams()
        if (filter) params.set('status', filter)

        const res = await fetch(`/api/deadlines?${params}`)
        if (!res.ok) throw new Error('Errore nel caricamento')
        const data = await res.json()
        setDeadlines(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }
    fetchDeadlines()
  }, [filter])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'medium',
    }).format(new Date(dateStr))
  }

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Stats
  const overdueCount = deadlines.filter((d) => d.status === 'OVERDUE').length
  const upcomingCount = deadlines.filter((d) => d.status === 'UPCOMING').length
  const thisWeek = deadlines.filter((d) => {
    const days = getDaysUntil(d.dueDate)
    return days >= 0 && days <= 7 && d.status !== 'COMPLETED'
  }).length
  const completedCount = deadlines.filter((d) => d.status === 'COMPLETED').length

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Scadenze
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestione scadenze formazioni, visite mediche, contratti e documenti
            </p>
          </div>
          <PageInfoTooltip
            title="Scadenziario HR"
            description="Monitora tutte le scadenze importanti: rinnovi formativi, visite mediche, contratti a termine, documenti in scadenza. Ricevi avvisi automatici in anticipo."
            tips={[
              'Le scadenze rosse sono già scadute e richiedono azione immediata',
              'Imposta promemoria a 30, 15 e 7 giorni prima',
              'Collega le scadenze ai dipendenti per una gestione centralizzata'
            ]}
          />
        </div>
        <Link
          href="/deadlines/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuova Scadenza
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => setFilter('OVERDUE')}
          className={`bg-white dark:bg-zinc-800 rounded-lg p-4 border cursor-pointer transition-colors ${
            filter === 'OVERDUE' ? 'border-red-500' : 'border-red-200 dark:border-red-800 hover:border-red-400'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Scadute</p>
          <p className="text-2xl font-bold text-red-600">
            {overdueCount}
          </p>
        </div>
        <div
          onClick={() => setFilter('UPCOMING')}
          className={`bg-white dark:bg-zinc-800 rounded-lg p-4 border cursor-pointer transition-colors ${
            filter === 'UPCOMING' ? 'border-amber-500' : 'border-amber-200 dark:border-amber-800 hover:border-amber-400'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">In Arrivo</p>
          <p className="text-2xl font-bold text-amber-600">
            {upcomingCount}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Questa Settimana</p>
          <p className="text-2xl font-bold text-blue-600">
            {thisWeek}
          </p>
        </div>
        <div
          onClick={() => setFilter('COMPLETED')}
          className={`bg-white dark:bg-zinc-800 rounded-lg p-4 border cursor-pointer transition-colors ${
            filter === 'COMPLETED' ? 'border-green-500' : 'border-gray-200 dark:border-zinc-700 hover:border-green-300'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Completate</p>
          <p className="text-2xl font-bold text-green-600">
            {completedCount}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => setFilter('')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            !filter
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-700 dark:text-gray-300'
          }`}
        >
          Tutte
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'PENDING'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-700 dark:text-gray-300'
          }`}
        >
          In Attesa
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
              <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Scadenza
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Dipendente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Giorni
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Stato
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
              ) : deadlines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nessuna scadenza trovata
                  </td>
                </tr>
              ) : (
                deadlines.map((deadline) => {
                  const daysUntil = getDaysUntil(deadline.dueDate)
                  const isOverdue = daysUntil < 0 && deadline.status !== 'COMPLETED'
                  const isUrgent = daysUntil >= 0 && daysUntil <= 7 && deadline.status !== 'COMPLETED'

                  return (
                    <tr
                      key={deadline.id}
                      className={`hover:bg-gray-50 dark:hover:bg-zinc-750 ${
                        isOverdue
                          ? 'bg-red-50 dark:bg-red-900/10'
                          : isUrgent
                          ? 'bg-amber-50 dark:bg-amber-900/10'
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {deadline.title}
                        </div>
                        {deadline.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {deadline.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            typeColors[deadline.type] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {typeLabels[deadline.type] || deadline.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {deadline.employee
                          ? `${deadline.employee.firstName} ${deadline.employee.lastName}`
                          : 'Aziendale'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(deadline.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {deadline.status === 'COMPLETED' ? (
                          <span className="text-green-600 text-sm">Completata</span>
                        ) : (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              daysUntil < 0
                                ? 'bg-red-100 text-red-700'
                                : daysUntil <= 7
                                ? 'bg-amber-100 text-amber-700'
                                : daysUntil <= 30
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {daysUntil < 0
                              ? `${Math.abs(daysUntil)} giorni fa`
                              : daysUntil === 0
                              ? 'Oggi'
                              : daysUntil === 1
                              ? 'Domani'
                              : `${daysUntil} giorni`}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            statusColors[deadline.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {statusLabels[deadline.status] || deadline.status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
