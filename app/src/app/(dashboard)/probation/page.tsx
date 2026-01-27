'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface ProbationOutcome {
  id: string
  probationStartDate: string
  probationEndDate: string
  evaluationDate: string
  technicalSkills: number | null
  adaptability: number | null
  teamwork: number | null
  punctuality: number | null
  initiative: number | null
  overallScore: number | null
  strengths: string | null
  areasForImprovement: string | null
  outcome: string
  outcomeDate: string
  outcomeNotes: string | null
  terminationDate: string | null
  employee: {
    id: string
    firstName: string
    lastName: string
    hireDate: string
    probationEndsAt: string | null
    status: string
  }
}

interface EmployeeInProbation {
  id: string
  firstName: string
  lastName: string
  hireDate: string
  probationEndsAt: string | null
  department: string | null
  jobTitle: string | null
}

const outcomeLabels: Record<string, string> = {
  CONFIRMED: 'Confermato',
  EXTENDED: 'Prorogato',
  TERMINATED: 'Non superato',
  RESIGNED: 'Dimesso',
}

const outcomeColors: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  EXTENDED: 'bg-yellow-100 text-yellow-700',
  TERMINATED: 'bg-red-100 text-red-700',
  RESIGNED: 'bg-gray-100 text-gray-700',
}

export default function ProbationPage() {
  const [outcomes, setOutcomes] = useState<ProbationOutcome[]>([])
  const [employeesInProbation, setEmployeesInProbation] = useState<EmployeeInProbation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')

  useEffect(() => {
    async function fetchData() {
      try {
        const [outcomesRes, employeesRes] = await Promise.all([
          fetch('/api/probation-outcome'),
          fetch('/api/employees?status=PROBATION'),
        ])

        if (outcomesRes.ok) {
          const outcomesData = await outcomesRes.json()
          setOutcomes(outcomesData)
        }

        if (employeesRes.ok) {
          const employeesData = await employeesRes.json()
          // Filter employees in probation
          const inProbation = employeesData.filter(
            (e: EmployeeInProbation) => e.probationEndsAt && new Date(e.probationEndsAt) >= new Date()
          )
          setEmployeesInProbation(inProbation)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'medium',
    }).format(new Date(dateStr))
  }

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null
    const end = new Date(endDate)
    const today = new Date()
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const renderScore = (score: number | null) => {
    if (score === null) return '-'
    const stars = Math.round(score)
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`text-sm ${i <= stars ? 'text-yellow-500' : 'text-gray-300 dark:text-zinc-600'}`}
          >
            ★
          </span>
        ))}
        <span className="text-xs text-gray-500 ml-1">({score.toFixed(1)})</span>
      </div>
    )
  }

  // Stats
  const confirmedCount = outcomes.filter((o) => o.outcome === 'CONFIRMED').length
  const terminatedCount = outcomes.filter((o) => o.outcome === 'TERMINATED').length
  const expiringCount = employeesInProbation.filter((e) => {
    const days = getDaysRemaining(e.probationEndsAt)
    return days !== null && days <= 14
  }).length

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Periodo di Prova
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Valutazione e gestione esiti periodo di prova
            </p>
          </div>
          <PageInfoTooltip
            title="Gestione Periodi di Prova"
            description="Monitora i dipendenti in periodo di prova e registra l'esito finale. Il sistema ti avvisa quando le scadenze si avvicinano per permetterti di valutare in tempo."
            tips={[
              'La durata del periodo di prova dipende dal livello CCNL',
              'Valuta il dipendente prima della scadenza del periodo',
              'Documenta sempre le motivazioni dell\'esito'
            ]}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Periodo di Prova</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {employeesInProbation.length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Scadenza (14gg)</p>
          <p className="text-2xl font-bold text-amber-600">
            {expiringCount}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Confermati</p>
          <p className="text-2xl font-bold text-green-600">
            {confirmedCount}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Non Superati</p>
          <p className="text-2xl font-bold text-red-600">
            {terminatedCount}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-zinc-700">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          In Corso ({employeesInProbation.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'completed'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Completati ({outcomes.length})
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Caricamento...</div>
      ) : activeTab === 'pending' ? (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Dipendente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Data Assunzione
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Scadenza Prova
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Giorni Rimanenti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                {employeesInProbation.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Nessun dipendente in periodo di prova
                    </td>
                  </tr>
                ) : (
                  employeesInProbation.map((employee) => {
                    const daysRemaining = getDaysRemaining(employee.probationEndsAt)
                    const isUrgent = daysRemaining !== null && daysRemaining <= 14

                    return (
                      <tr
                        key={employee.id}
                        className={`hover:bg-gray-50 dark:hover:bg-zinc-750 ${
                          isUrgent ? 'bg-amber-50 dark:bg-amber-900/10' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {employee.jobTitle || employee.department || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(employee.hireDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(employee.probationEndsAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {daysRemaining !== null ? (
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                daysRemaining <= 7
                                  ? 'bg-red-100 text-red-700'
                                  : daysRemaining <= 14
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {daysRemaining} giorni
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/probation/evaluate/${employee.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Valuta
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
      ) : (
        <div className="space-y-4">
          {outcomes.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700">
              Nessuna valutazione completata
            </div>
          ) : (
            outcomes.map((outcome) => (
              <div
                key={outcome.id}
                className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        {outcome.employee.firstName[0]}{outcome.employee.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {outcome.employee.firstName} {outcome.employee.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Periodo: {formatDate(outcome.probationStartDate)} - {formatDate(outcome.probationEndDate)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded ${
                      outcomeColors[outcome.outcome] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {outcomeLabels[outcome.outcome] || outcome.outcome}
                  </span>
                </div>

                {outcome.overallScore && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Competenze Tecniche</p>
                      {renderScore(outcome.technicalSkills)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Adattabilità</p>
                      {renderScore(outcome.adaptability)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lavoro di Squadra</p>
                      {renderScore(outcome.teamwork)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Puntualità</p>
                      {renderScore(outcome.punctuality)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Iniziativa</p>
                      {renderScore(outcome.initiative)}
                    </div>
                  </div>
                )}

                {(outcome.strengths || outcome.areasForImprovement) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {outcome.strengths && (
                      <div>
                        <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Punti di Forza</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{outcome.strengths}</p>
                      </div>
                    )}
                    {outcome.areasForImprovement && (
                      <div>
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Aree di Miglioramento</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{outcome.areasForImprovement}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>Valutato il {formatDate(outcome.evaluationDate)}</span>
                  {outcome.overallScore && (
                    <span className="font-medium">
                      Punteggio complessivo: {outcome.overallScore.toFixed(1)}/5
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
