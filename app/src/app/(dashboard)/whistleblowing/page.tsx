'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface WhistleblowingReport {
  id: string
  reporterType: string
  reporterName: string | null
  reportDate: string
  category: string
  title: string
  status: string
  acknowledgedAt: string | null
  closedAt: string | null
  _count: {
    messages: number
    documents: number
  }
}

const categoryLabels: Record<string, string> = {
  FRAUD: 'Frode',
  CORRUPTION: 'Corruzione',
  SAFETY_VIOLATION: 'Violazioni sicurezza',
  ENVIRONMENTAL: 'Violazioni ambientali',
  DISCRIMINATION: 'Discriminazione',
  HARASSMENT: 'Molestie',
  DATA_BREACH: 'Violazione dati',
  CONFLICT_OF_INTEREST: 'Conflitto interessi',
  FINANCIAL_IRREGULARITY: 'Irregolarità finanziarie',
  OTHER: 'Altro',
}

const statusLabels: Record<string, string> = {
  RECEIVED: 'Ricevuta',
  ACKNOWLEDGED: 'Presa in carico',
  UNDER_INVESTIGATION: 'In indagine',
  ADDITIONAL_INFO_REQUESTED: 'Richieste info',
  SUBSTANTIATED: 'Fondata',
  UNSUBSTANTIATED: 'Non fondata',
  CLOSED: 'Chiusa',
}

const statusColors: Record<string, string> = {
  RECEIVED: 'bg-yellow-100 text-yellow-700',
  ACKNOWLEDGED: 'bg-blue-100 text-blue-700',
  UNDER_INVESTIGATION: 'bg-purple-100 text-purple-700',
  ADDITIONAL_INFO_REQUESTED: 'bg-orange-100 text-orange-700',
  SUBSTANTIATED: 'bg-red-100 text-red-700',
  UNSUBSTANTIATED: 'bg-gray-100 text-gray-700',
  CLOSED: 'bg-green-100 text-green-700',
}

const reporterTypeLabels: Record<string, string> = {
  ANONYMOUS: 'Anonimo',
  CONFIDENTIAL: 'Riservato',
  IDENTIFIED: 'Identificato',
}

export default function WhistleblowingPage() {
  const [reports, setReports] = useState<WhistleblowingReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    async function fetchReports() {
      try {
        const params = new URLSearchParams()
        if (filter) params.set('status', filter)

        const res = await fetch(`/api/whistleblowing?${params}`)
        if (!res.ok) throw new Error('Errore nel caricamento')
        const data = await res.json()
        setReports(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [filter])

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'medium',
    }).format(new Date(dateStr))
  }

  // Calculate if any report needs attention (not acknowledged within 7 days)
  const urgentReports = reports.filter((r) => {
    if (r.status !== 'RECEIVED') return false
    const daysSinceReport = (Date.now() - new Date(r.reportDate).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceReport >= 7
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Whistleblowing
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestione segnalazioni D.Lgs. 24/2023
        </p>
      </div>

      {/* Alert for urgent reports */}
      {urgentReports.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">!</span>
            <div>
              <p className="font-medium text-red-800">
                {urgentReports.length} segnalazione/i da prendere in carico
              </p>
              <p className="text-sm text-red-600">
                D.Lgs. 24/2023: obbligo di conferma ricezione entro 7 giorni
              </p>
            </div>
          </div>
        </div>
      )}

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
            {reports.length}
          </p>
        </div>
        <div
          onClick={() => setFilter('RECEIVED')}
          className={`bg-white dark:bg-zinc-800 rounded-lg p-4 border cursor-pointer transition-colors ${
            filter === 'RECEIVED' ? 'border-yellow-500' : 'border-gray-200 dark:border-zinc-700 hover:border-yellow-300'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Da gestire</p>
          <p className="text-2xl font-bold text-yellow-600">
            {reports.filter((r) => r.status === 'RECEIVED').length}
          </p>
        </div>
        <div
          onClick={() => setFilter('UNDER_INVESTIGATION')}
          className={`bg-white dark:bg-zinc-800 rounded-lg p-4 border cursor-pointer transition-colors ${
            filter === 'UNDER_INVESTIGATION' ? 'border-purple-500' : 'border-gray-200 dark:border-zinc-700 hover:border-purple-300'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">In indagine</p>
          <p className="text-2xl font-bold text-purple-600">
            {reports.filter((r) => r.status === 'UNDER_INVESTIGATION').length}
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
            {reports.filter((r) => r.status === 'CLOSED').length}
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
          Obblighi D.Lgs. 24/2023
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Conferma ricezione entro 7 giorni dalla segnalazione</li>
          <li>• Feedback al segnalante entro 3 mesi</li>
          <li>• Riservatezza dell&apos;identità del segnalante</li>
          <li>• Divieto di ritorsioni</li>
        </ul>
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
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Titolo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tipo
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
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nessuna segnalazione
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-zinc-750">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(report.reportDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {report.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {report._count.messages} messaggi, {report._count.documents} allegati
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {categoryLabels[report.category] || report.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {reporterTypeLabels[report.reporterType] || report.reporterType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          statusColors[report.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusLabels[report.status] || report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/whistleblowing/${report.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Gestisci
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
