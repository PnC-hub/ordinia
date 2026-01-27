'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface ComplianceStatus {
  score: number
  statusLevel: 'excellent' | 'good' | 'warning' | 'critical'
  metrics: {
    totalEmployees: number
    employeesWithGdprConsent: number
    gdprConsentRate: number
    overdueDeadlines: number
    upcomingDeadlines: number
    documentsExpiringSoon: number
    recentAuditLogs: number
    safetyTrainingRate: number
    safetyTrainingMissing: number
    safetyTrainingExpired: number
    dvrRate: number
    dvrAcknowledgmentsPending: number
    disciplinaryCodePosted: boolean
    activeDisciplinaryProcedures: number
    pendingWhistleblowingReports: number
  }
  checklist: {
    id: string
    title: string
    description: string
    completed: boolean
    count: number
    total?: number
    priority: 'high' | 'medium' | 'low'
    category: string
  }[]
}

const categoryLabels: Record<string, string> = {
  gdpr: 'GDPR',
  safety: 'Sicurezza D.Lgs. 81/2008',
  disciplinary: 'Disciplinare Art. 7',
  deadlines: 'Scadenze',
  documents: 'Documenti',
  whistleblowing: 'Whistleblowing',
  audit: 'Audit',
}

const categoryIcons: Record<string, string> = {
  gdpr: '!',
  safety: '!',
  disciplinary: '!',
  deadlines: '!',
  documents: '!',
  whistleblowing: '!',
  audit: '!',
}

export default function ComplianceDashboardPage() {
  const [status, setStatus] = useState<ComplianceStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/compliance/status')
        if (!res.ok) throw new Error('Errore nel caricamento')
        const data = await res.json()
        setStatus(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [])

  const getScoreColor = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'good':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
      case 'warning':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-300'
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
      case 'low':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    )
  }

  if (!status) return null

  // Group checklist by category
  const checklistByCategory = status.checklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof status.checklist>)

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Compliance
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitora lo stato di conformità GDPR, sicurezza e normativo del tuo studio
          </p>
        </div>
        <PageInfoTooltip
          title="Stato Compliance"
          description="Verifica il livello di conformità della tua azienda rispetto a GDPR, sicurezza sul lavoro e normative HR. Il punteggio indica quanti adempimenti hai completato."
          tips={[
            'Completa tutti gli elementi per raggiungere il 100%',
            'Gli elementi rossi richiedono azione immediata',
            'Consulta l\'audit log per lo storico delle attività'
          ]}
        />
      </div>

      {/* Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          className={`col-span-1 rounded-xl p-6 ${getScoreColor(status.statusLevel)}`}
        >
          <p className="text-sm font-medium opacity-80">Punteggio Compliance</p>
          <p className="text-5xl font-bold mt-2">{status.score}</p>
          <p className="text-sm mt-1 opacity-80">/100</p>
        </div>

        <div className="col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Dipendenti</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {status.metrics.totalEmployees}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Consensi GDPR</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {status.metrics.gdprConsentRate}%
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Formazione Sicurezza</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {status.metrics.safetyTrainingRate}%
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">DVR Presa Visione</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {status.metrics.dvrRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {status.metrics.overdueDeadlines > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-red-600 text-xl">!</span>
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">
                  {status.metrics.overdueDeadlines} scadenze in ritardo
                </p>
                <Link href="/deadlines" className="text-sm text-red-600 hover:underline">
                  Gestisci scadenze
                </Link>
              </div>
            </div>
          </div>
        )}
        {status.metrics.safetyTrainingExpired > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 text-xl">!</span>
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  {status.metrics.safetyTrainingExpired} formazioni scadute
                </p>
                <Link href="/safety" className="text-sm text-amber-600 hover:underline">
                  Gestisci formazioni
                </Link>
              </div>
            </div>
          </div>
        )}
        {status.metrics.pendingWhistleblowingReports > 0 && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-purple-600 text-xl">!</span>
              <div>
                <p className="font-medium text-purple-800 dark:text-purple-300">
                  {status.metrics.pendingWhistleblowingReports} segnalazioni da gestire
                </p>
                <Link href="/whistleblowing" className="text-sm text-purple-600 hover:underline">
                  Gestisci segnalazioni
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checklist by Category */}
      {Object.entries(checklistByCategory).map(([category, items]) => (
        <div
          key={category}
          className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden mb-6"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400">{categoryIcons[category]}</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {categoryLabels[category] || category}
            </h2>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
            {items.map((item) => (
              <li key={item.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.completed
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-400 dark:bg-zinc-700 dark:text-gray-500'
                    }`}
                  >
                    {item.completed ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        item.completed
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.total !== undefined && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {item.count}/{item.total}
                    </span>
                  )}
                  {!item.completed && item.count > 0 && !item.total && (
                    <span className="text-sm text-red-600 font-medium">
                      {item.count} da gestire
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${getPriorityBadge(
                      item.priority
                    )}`}
                  >
                    {item.priority === 'high'
                      ? 'Alta'
                      : item.priority === 'medium'
                      ? 'Media'
                      : 'Bassa'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/compliance/audit"
          className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400">!</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Audit Log</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {status.metrics.recentAuditLogs} eventi ultimi 7 giorni
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/safety"
          className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-400">!</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Sicurezza Lavoro</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {status.metrics.safetyTrainingMissing} formazioni mancanti
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/whistleblowing"
          className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400">!</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Whistleblowing</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {status.metrics.pendingWhistleblowingReports} segnalazioni pendenti
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/employees"
          className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700 hover:border-green-500 dark:hover:border-green-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400">!</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Dipendenti</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {status.metrics.employeesWithGdprConsent}/{status.metrics.totalEmployees}{' '}
                con consenso GDPR
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
