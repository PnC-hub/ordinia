'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface OnboardingTimeline {
  id: string
  phase: string
  title: string
  description: string | null
  status: string
  dueDate: string | null
  startedAt: string | null
  completedAt: string | null
  assignedTo: string | null
  notes: string | null
  employee: {
    id: string
    firstName: string
    lastName: string
    hireDate: string
    department: string | null
  }
}

const phaseLabels: Record<string, string> = {
  DOCUMENTS: 'Documenti Assunzione',
  PRIVACY_CONSENT: 'Informativa Privacy',
  SAFETY_TRAINING: 'Formazione Sicurezza',
  DVR_ACKNOWLEDGMENT: 'Presa Visione DVR',
  DISCIPLINARY_CODE: 'Codice Disciplinare',
  COMPANY_POLICIES: 'Regolamento Aziendale',
  IT_SETUP: 'Configurazione IT',
  TEAM_INTRODUCTION: 'Presentazione Team',
  ROLE_TRAINING: 'Formazione Ruolo',
  PROBATION_START: 'Inizio Periodo Prova',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Da fare',
  IN_PROGRESS: 'In corso',
  COMPLETED: 'Completato',
  SKIPPED: 'Saltato',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  SKIPPED: 'bg-yellow-100 text-yellow-700',
}

export default function OnboardingPage() {
  const [timelines, setTimelines] = useState<OnboardingTimeline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [groupByEmployee, setGroupByEmployee] = useState(true)

  useEffect(() => {
    async function fetchTimelines() {
      try {
        const res = await fetch('/api/onboarding-timeline')
        if (!res.ok) throw new Error('Errore nel caricamento')
        const data = await res.json()
        setTimelines(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }
    fetchTimelines()
  }, [])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'medium',
    }).format(new Date(dateStr))
  }

  // Group by employee
  const groupedTimelines = timelines.reduce((acc, timeline) => {
    const empId = timeline.employee.id
    if (!acc[empId]) {
      acc[empId] = {
        employee: timeline.employee,
        phases: [],
      }
    }
    acc[empId].phases.push(timeline)
    return acc
  }, {} as Record<string, { employee: OnboardingTimeline['employee']; phases: OnboardingTimeline[] }>)

  const employees = Object.values(groupedTimelines)

  // Calculate stats
  const totalPhases = timelines.length
  const completedPhases = timelines.filter((t) => t.status === 'COMPLETED').length
  const pendingPhases = timelines.filter((t) => t.status === 'PENDING').length
  const inProgressPhases = timelines.filter((t) => t.status === 'IN_PROGRESS').length

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Onboarding Timeline
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestione fasi procedurali di inserimento nuovi dipendenti
            </p>
          </div>
          <PageInfoTooltip
            title="Processo di Onboarding"
            description="Monitora tutte le fasi di inserimento dei nuovi assunti: documenti da firmare, formazione, consegna materiali. Il sistema traccia lo stato di avanzamento per ogni dipendente."
            tips={[
              'Completa tutte le fasi entro i primi 30 giorni',
              'Le fasi con scadenza vengono evidenziate in rosso',
              'Usa la vista per dipendente per monitorare i singoli casi'
            ]}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setGroupByEmployee(!groupByEmployee)}
            className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
          >
            {groupByEmployee ? 'Vista Lista' : 'Vista per Dipendente'}
          </button>
          <Link
            href="/employees/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nuovo Dipendente
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Dipendenti in Onboarding</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {employees.length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Fasi Completate</p>
          <p className="text-2xl font-bold text-green-600">
            {completedPhases}/{totalPhases}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Corso</p>
          <p className="text-2xl font-bold text-blue-600">
            {inProgressPhases}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Da Completare</p>
          <p className="text-2xl font-bold text-orange-600">
            {pendingPhases}
          </p>
        </div>
      </div>

      {/* Phases Legend */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700 mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Fasi Obbligatorie Onboarding
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(phaseLabels).map(([key, label]) => (
            <span
              key={key}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Caricamento...</div>
      ) : groupByEmployee ? (
        <div className="space-y-6">
          {employees.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700">
              Nessun onboarding in corso
            </div>
          ) : (
            employees.map(({ employee, phases }) => {
              const completed = phases.filter((p) => p.status === 'COMPLETED').length
              const total = phases.length
              const progress = total > 0 ? (completed / total) * 100 : 0

              return (
                <div
                  key={employee.id}
                  className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden"
                >
                  {/* Employee Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Assunto il {formatDate(employee.hireDate)} - {employee.department || 'Nessun reparto'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {completed}/{total} completate
                      </p>
                      <div className="w-32 h-2 bg-gray-200 dark:bg-zinc-700 rounded-full mt-1">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phases Timeline */}
                  <div className="p-4">
                    <div className="flex flex-wrap gap-3">
                      {phases
                        .sort((a, b) => {
                          const order = Object.keys(phaseLabels)
                          return order.indexOf(a.phase) - order.indexOf(b.phase)
                        })
                        .map((phase) => (
                          <div
                            key={phase.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                              phase.status === 'COMPLETED'
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : phase.status === 'IN_PROGRESS'
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                phase.status === 'COMPLETED'
                                  ? 'bg-green-500'
                                  : phase.status === 'IN_PROGRESS'
                                  ? 'bg-blue-500'
                                  : 'bg-gray-300 dark:bg-zinc-600'
                              }`}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {phaseLabels[phase.phase] || phase.phase}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Dipendente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Fase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Scadenza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Assegnato a
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                {timelines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Nessun onboarding in corso
                    </td>
                  </tr>
                ) : (
                  timelines.map((timeline) => (
                    <tr key={timeline.id} className="hover:bg-gray-50 dark:hover:bg-zinc-750">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {timeline.employee.firstName} {timeline.employee.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {phaseLabels[timeline.phase] || timeline.phase}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            statusColors[timeline.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {statusLabels[timeline.status] || timeline.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(timeline.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {timeline.assignedTo || '-'}
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
