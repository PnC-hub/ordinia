'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface SafetyTraining {
  id: string
  trainingType: string
  title: string
  hoursCompleted: number
  hoursRequired: number
  status: string
  expiresAt: string | null
  employee: {
    id: string
    firstName: string
    lastName: string
    department: string | null
  }
}

const trainingTypeLabels: Record<string, string> = {
  GENERAL: 'Formazione Generale (4h)',
  SPECIFIC_LOW: 'Rischio Basso (4h)',
  SPECIFIC_MEDIUM: 'Rischio Medio (8h)',
  SPECIFIC_HIGH: 'Rischio Alto (12h)',
  FIRST_AID: 'Primo Soccorso',
  FIRE_PREVENTION: 'Antincendio',
  RLS: 'RLS (32h)',
  PREPOSTO: 'Preposto (8h)',
  DIRIGENTE: 'Dirigente (16h)',
  UPDATE: 'Aggiornamento',
}

const statusLabels: Record<string, string> = {
  NOT_STARTED: 'Non iniziata',
  IN_PROGRESS: 'In corso',
  COMPLETED: 'Completata',
  EXPIRED: 'Scaduta',
}

const statusColors: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-red-100 text-red-700',
}

export default function SafetyPage() {
  const [trainings, setTrainings] = useState<SafetyTraining[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    async function fetchTrainings() {
      try {
        const params = new URLSearchParams()
        if (filter) params.set('status', filter)

        const res = await fetch(`/api/safety-training?${params}`)
        if (!res.ok) throw new Error('Errore nel caricamento')
        const data = await res.json()
        setTrainings(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }
    fetchTrainings()
  }, [filter])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'medium',
    }).format(new Date(dateStr))
  }

  // Group by status for summary cards
  const statusCounts = trainings.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sicurezza sul Lavoro
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestione formazione D.Lgs. 81/2008 e DVR
          </p>
        </div>
        <Link
          href="/safety/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuova Formazione
        </Link>
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
            {trainings.length}
          </p>
        </div>
        <div
          onClick={() => setFilter('NOT_STARTED')}
          className={`bg-white dark:bg-zinc-800 rounded-lg p-4 border cursor-pointer transition-colors ${
            filter === 'NOT_STARTED' ? 'border-gray-500' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-400'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Non iniziate</p>
          <p className="text-2xl font-bold text-gray-600">
            {statusCounts['NOT_STARTED'] || 0}
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
            {statusCounts['COMPLETED'] || 0}
          </p>
        </div>
        <div
          onClick={() => setFilter('EXPIRED')}
          className={`bg-white dark:bg-zinc-800 rounded-lg p-4 border cursor-pointer transition-colors ${
            filter === 'EXPIRED' ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700 hover:border-red-300'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Scadute</p>
          <p className="text-2xl font-bold text-red-600">
            {statusCounts['EXPIRED'] || 0}
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/safety/dvr"
          className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700 hover:border-amber-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              <span className="text-amber-600 dark:text-amber-400 text-xl">!</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">DVR - Presa Visione</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gestisci le prese visione del Documento Valutazione Rischi
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
                  Tipo Formazione
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Ore
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Scadenza
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Caricamento...
                  </td>
                </tr>
              ) : trainings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nessuna formazione trovata
                  </td>
                </tr>
              ) : (
                trainings.map((training) => (
                  <tr key={training.id} className="hover:bg-gray-50 dark:hover:bg-zinc-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {training.employee.firstName} {training.employee.lastName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {training.employee.department || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {trainingTypeLabels[training.trainingType] || training.trainingType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {training.hoursCompleted}/{training.hoursRequired}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          statusColors[training.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusLabels[training.status] || training.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(training.expiresAt)}
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
