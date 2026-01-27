'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface TimeEntry {
  id: string
  date: string
  clockIn: string
  clockOut: string | null
  totalMinutes: number | null
  netMinutes: number | null
  status: string
  notes: string | null
  anomalyType: string | null
  employee: {
    id: string
    firstName: string
    lastName: string
    department: string | null
  }
  workLocation: {
    name: string
  } | null
}

interface AttendanceStats {
  totalPresent: number
  totalAbsent: number
  lateArrivals: number
  earlyDepartures: number
  pendingApprovals: number
}

const statusLabels: Record<string, string> = {
  PENDING: 'In attesa',
  APPROVED: 'Approvato',
  REJECTED: 'Rifiutato',
  MODIFIED: 'Modificato',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  MODIFIED: 'bg-blue-100 text-blue-700',
}

export default function AttendanceManagementPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filterStatus, setFilterStatus] = useState('')
  const [filterEmployee, setFilterEmployee] = useState('')

  useEffect(() => {
    fetchAttendance()
  }, [selectedDate, filterStatus, filterEmployee])

  async function fetchAttendance() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('dateFrom', selectedDate)
      params.set('dateTo', selectedDate)
      if (filterStatus) params.set('status', filterStatus)
      if (filterEmployee) params.set('employeeId', filterEmployee)

      const res = await fetch(`/api/attendance?${params}`)
      if (!res.ok) throw new Error('Errore nel caricamento')
      const data = await res.json()
      setEntries(data)

      // Calculate stats
      const pending = data.filter((e: TimeEntry) => e.status === 'PENDING').length
      const anomalies = data.filter((e: TimeEntry) => e.anomalyType).length
      setStats({
        totalPresent: data.length,
        totalAbsent: 0, // Would need employee count to calculate
        lateArrivals: anomalies,
        earlyDepartures: 0,
        pendingApprovals: pending,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(id: string) {
    try {
      const res = await fetch(`/api/attendance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      })
      if (!res.ok) throw new Error('Errore nell\'approvazione')
      fetchAttendance()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  async function handleReject(id: string) {
    const notes = prompt('Inserisci il motivo del rifiuto:')
    if (!notes) return

    try {
      const res = await fetch(`/api/attendance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', managerNotes: notes }),
      })
      if (!res.ok) throw new Error('Errore nel rifiuto')
      fetchAttendance()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestione Presenze
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitora e approva le timbrature dei dipendenti
            </p>
          </div>
          <PageInfoTooltip
            title="Monitoraggio Presenze"
            description="Visualizza le timbrature giornaliere di tutti i dipendenti, approva quelle in attesa e gestisci le anomalie. Il sistema calcola automaticamente ore lavorate e straordinari."
            tips={[
              'Filtra per data o dipendente per trovare rapidamente le timbrature',
              'Le anomalie (ritardi, uscite anticipate) sono evidenziate in rosso',
              'Esporta i dati per l\'elaborazione del cedolino'
            ]}
          />
        </div>
        <Link
          href="/attendance/report"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Genera Report
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Presenti Oggi</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalPresent}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Assenti</p>
            <p className="text-3xl font-bold text-red-600">{stats.totalAbsent}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Ritardi</p>
            <p className="text-3xl font-bold text-amber-600">{stats.lateArrivals}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Uscite Anticipate</p>
            <p className="text-3xl font-bold text-orange-600">{stats.earlyDepartures}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Da Approvare</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stato
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
            >
              <option value="">Tutti</option>
              <option value="PENDING">In attesa</option>
              <option value="APPROVED">Approvati</option>
              <option value="REJECTED">Rifiutati</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedDate(new Date().toISOString().split('T')[0])
                setFilterStatus('')
                setFilterEmployee('')
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Reset Filtri
            </button>
          </div>
        </div>
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
                  Dipendente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Entrata
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Uscita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Totale
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
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nessuna timbratura trovata per questa data
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`hover:bg-gray-50 dark:hover:bg-zinc-750 ${
                      entry.anomalyType ? 'bg-amber-50 dark:bg-amber-900/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            {entry.employee.firstName[0]}{entry.employee.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {entry.employee.firstName} {entry.employee.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {entry.employee.department || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-gray-900 dark:text-white">{formatTime(entry.clockIn)}</p>
                      {entry.workLocation && (
                        <p className="text-xs text-gray-500">{entry.workLocation.name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {entry.clockOut ? formatTime(entry.clockOut) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {formatDuration(entry.netMinutes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          statusColors[entry.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusLabels[entry.status] || entry.status}
                      </span>
                      {entry.anomalyType && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium rounded bg-amber-100 text-amber-700">
                          Anomalia
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(entry.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Approva
                          </button>
                          <button
                            onClick={() => handleReject(entry.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Rifiuta
                          </button>
                        </div>
                      )}
                      <Link
                        href={`/attendance/${entry.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Dettagli
                      </Link>
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
