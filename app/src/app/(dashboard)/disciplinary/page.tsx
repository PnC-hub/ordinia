'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface DisciplinaryProcedure {
  id: string
  infractionType: string
  infractionDate: string
  infractionDescription: string
  status: string
  contestationDate: string | null
  defenseDeadline: string | null
  defenseReceived: boolean
  defenseDate: string | null
  sanctionType: string | null
  sanctionDate: string | null
  closedAt: string | null
  employee: {
    id: string
    firstName: string
    lastName: string
    department: string | null
    jobTitle: string | null
  }
  documents: Array<{
    id: string
    name: string
    type: string
  }>
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Bozza',
  CONTESTATION_SENT: 'Contestazione Inviata',
  AWAITING_DEFENSE: 'In Attesa Difese',
  DEFENSE_RECEIVED: 'Difese Ricevute',
  EVALUATION: 'In Valutazione',
  SANCTION_ISSUED: 'Provvedimento Emesso',
  CLOSED: 'Chiuso',
  ARCHIVED: 'Archiviato',
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  CONTESTATION_SENT: 'bg-yellow-100 text-yellow-700',
  AWAITING_DEFENSE: 'bg-blue-100 text-blue-700',
  DEFENSE_RECEIVED: 'bg-purple-100 text-purple-700',
  EVALUATION: 'bg-orange-100 text-orange-700',
  SANCTION_ISSUED: 'bg-red-100 text-red-700',
  CLOSED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
}

const infractionLabels: Record<string, string> = {
  MINOR: 'Lieve',
  MODERATE: 'Moderata',
  SERIOUS: 'Grave',
  VERY_SERIOUS: 'Gravissima',
}

export default function DisciplinaryPage() {
  const [procedures, setProcedures] = useState<DisciplinaryProcedure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    async function fetchProcedures() {
      try {
        const params = new URLSearchParams()
        if (filter) params.set('status', filter)

        const res = await fetch(`/api/disciplinary?${params}`)
        if (!res.ok) throw new Error('Errore nel caricamento')
        const data = await res.json()
        setProcedures(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }
    fetchProcedures()
  }, [filter])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'medium',
    }).format(new Date(dateStr))
  }

  // Count by status
  const statusCounts = procedures.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const activeProcedures = procedures.filter(
    (p) => !['CLOSED', 'ARCHIVED'].includes(p.status)
  )
  const awaitingDefense = procedures.filter(
    (p) => p.status === 'AWAITING_DEFENSE'
  )

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Procedura Disciplinare
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Art. 7 Statuto dei Lavoratori - Gestione contestazioni e sanzioni
            </p>
          </div>
          <PageInfoTooltip
            title="Gestione Disciplinare"
            description="Avvia e gestisci le procedure disciplinari nel rispetto dell'Art. 7 Statuto dei Lavoratori. Il sistema ti guida nelle fasi corrette: contestazione, giustificazioni, sanzione."
            tips={[
              'Rispetta sempre il termine di 5 giorni per le giustificazioni',
              'Conserva tutta la documentazione a supporto',
              'La sanzione deve essere proporzionata al fatto contestato'
            ]}
          />
        </div>
        <Link
          href="/disciplinary/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuova Procedura
        </Link>
      </div>

      {/* Info Card */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-amber-700 dark:text-amber-300 text-sm">!</span>
          </div>
          <div>
            <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
              Procedura Art. 7 L. 300/1970
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              1. Contestazione scritta specifica e tempestiva<br />
              2. 5 giorni per le difese del lavoratore<br />
              3. Audizione del lavoratore (se richiesta)<br />
              4. Provvedimento motivato
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => setFilter('')}
          className={`bg-white dark:bg-zinc-800 rounded-lg p-4 border cursor-pointer transition-colors ${
            !filter ? 'border-blue-500' : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Totale</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {procedures.length}
          </p>
        </div>
        <div
          onClick={() => setFilter('AWAITING_DEFENSE')}
          className={`bg-white dark:bg-zinc-800 rounded-lg p-4 border cursor-pointer transition-colors ${
            filter === 'AWAITING_DEFENSE' ? 'border-blue-500' : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">In Attesa Difese</p>
          <p className="text-2xl font-bold text-blue-600">
            {awaitingDefense.length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Procedure Attive</p>
          <p className="text-2xl font-bold text-orange-600">
            {activeProcedures.length}
          </p>
        </div>
        <div
          onClick={() => setFilter('CLOSED')}
          className={`bg-white dark:bg-zinc-800 rounded-lg p-4 border cursor-pointer transition-colors ${
            filter === 'CLOSED' ? 'border-green-500' : 'border-gray-200 dark:border-zinc-700 hover:border-green-300'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Chiuse</p>
          <p className="text-2xl font-bold text-green-600">
            {statusCounts['CLOSED'] || 0}
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/disciplinary/code"
          className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700 hover:border-red-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-xl">C</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Codice Disciplinare</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gestisci affissione e visualizzazioni
              </p>
            </div>
          </div>
        </Link>
        <Link
          href="/compliance"
          className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700 hover:border-green-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-xl">%</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Dashboard Compliance</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Visualizza lo stato di conformità generale
              </p>
            </div>
          </div>
        </Link>
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
                  Dipendente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tipo Infrazione
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Data Infrazione
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Scadenza Difese
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
              ) : procedures.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nessuna procedura disciplinare trovata
                  </td>
                </tr>
              ) : (
                procedures.map((procedure) => {
                  const isUrgent =
                    procedure.status === 'AWAITING_DEFENSE' &&
                    procedure.defenseDeadline &&
                    new Date(procedure.defenseDeadline) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)

                  return (
                    <tr
                      key={procedure.id}
                      className={`hover:bg-gray-50 dark:hover:bg-zinc-750 ${
                        isUrgent ? 'bg-red-50 dark:bg-red-900/10' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {procedure.employee.firstName} {procedure.employee.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {procedure.employee.jobTitle || procedure.employee.department || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {infractionLabels[procedure.infractionType] || procedure.infractionType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(procedure.infractionDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            statusColors[procedure.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {statusLabels[procedure.status] || procedure.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {procedure.defenseDeadline ? (
                          <span className={isUrgent ? 'text-red-600 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                            {formatDate(procedure.defenseDeadline)}
                            {isUrgent && ' ⚠️'}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/disciplinary/${procedure.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Dettagli
                        </Link>
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
