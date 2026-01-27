'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface PerformanceReview {
  id: string
  reviewDate: string
  technicalSkills: number | null
  teamwork: number | null
  communication: number | null
  reliability: number | null
  growthPotential: number | null
  overallScore: number | null
  strengths: string | null
  improvements: string | null
  goals: string | null
  status: string
  employee: {
    id: string
    firstName: string
    lastName: string
    department: string | null
    jobTitle: string | null
  }
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Bozza',
  COMPLETED: 'Completata',
  ACKNOWLEDGED: 'Presa Visione',
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  ACKNOWLEDGED: 'bg-green-100 text-green-700',
}

export default function PerformancePage() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    async function fetchReviews() {
      try {
        const params = new URLSearchParams()
        if (filter) params.set('status', filter)
        if (selectedYear) params.set('year', selectedYear)

        const res = await fetch(`/api/performance?${params}`)
        if (!res.ok) throw new Error('Errore nel caricamento')
        const data = await res.json()
        setReviews(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [filter, selectedYear])

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'medium',
    }).format(new Date(dateStr))
  }

  const renderStars = (score: number | null) => {
    if (score === null) return <span className="text-gray-400">-</span>
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`text-sm ${i <= score ? 'text-yellow-500' : 'text-gray-300 dark:text-zinc-600'}`}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500'
    if (score >= 4) return 'text-green-600'
    if (score >= 3) return 'text-blue-600'
    if (score >= 2) return 'text-amber-600'
    return 'text-red-600'
  }

  // Stats
  const completedCount = reviews.filter((r) => r.status === 'COMPLETED' || r.status === 'ACKNOWLEDGED').length
  const draftCount = reviews.filter((r) => r.status === 'DRAFT').length
  const avgScore = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.overallScore || 0), 0) / reviews.filter((r) => r.overallScore).length
    : 0

  // Years for filter
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2]

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Performance
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Valutazioni delle prestazioni dei dipendenti
            </p>
          </div>
          <PageInfoTooltip
            title="Valutazione Prestazioni"
            description="Esegui valutazioni periodiche delle performance dei dipendenti. Registra feedback, obiettivi e punteggi per avere uno storico delle prestazioni."
            tips={[
              'Effettua valutazioni almeno una volta l\'anno',
              'Usa i commenti per feedback costruttivi',
              'Confronta le valutazioni nel tempo per vedere l\'evoluzione'
            ]}
          />
        </div>
        <Link
          href="/performance/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuova Valutazione
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Totale {selectedYear}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {reviews.length}
          </p>
        </div>
        <div
          onClick={() => setFilter(filter === 'COMPLETED' ? '' : 'COMPLETED')}
          className={`bg-white dark:bg-zinc-800 rounded-lg p-4 border cursor-pointer transition-colors ${
            filter === 'COMPLETED' ? 'border-blue-500' : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Completate</p>
          <p className="text-2xl font-bold text-blue-600">
            {completedCount}
          </p>
        </div>
        <div
          onClick={() => setFilter(filter === 'DRAFT' ? '' : 'DRAFT')}
          className={`bg-white dark:bg-zinc-800 rounded-lg p-4 border cursor-pointer transition-colors ${
            filter === 'DRAFT' ? 'border-gray-500' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-400'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Bozze</p>
          <p className="text-2xl font-bold text-gray-600">
            {draftCount}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Media Punteggio</p>
          <p className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
            {avgScore > 0 ? avgScore.toFixed(1) : '-'}/5
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 text-sm border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
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
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Caricamento...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700">
          Nessuna valutazione trovata per {selectedYear}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {review.employee.firstName[0]}{review.employee.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {review.employee.firstName} {review.employee.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {review.employee.jobTitle || review.employee.department || '-'} - {formatDate(review.reviewDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {review.overallScore && (
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(review.overallScore)}`}>
                        {review.overallScore.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500">punteggio</p>
                    </div>
                  )}
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded ${
                      statusColors[review.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {statusLabels[review.status] || review.status}
                  </span>
                </div>
              </div>

              {/* Scores Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Competenze Tecniche</p>
                  {renderStars(review.technicalSkills)}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lavoro di Squadra</p>
                  {renderStars(review.teamwork)}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Comunicazione</p>
                  {renderStars(review.communication)}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Affidabilità</p>
                  {renderStars(review.reliability)}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Potenziale Crescita</p>
                  {renderStars(review.growthPotential)}
                </div>
              </div>

              {/* Notes */}
              {(review.strengths || review.improvements || review.goals) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {review.strengths && (
                    <div>
                      <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Punti di Forza</p>
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{review.strengths}</p>
                    </div>
                  )}
                  {review.improvements && (
                    <div>
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Aree di Miglioramento</p>
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{review.improvements}</p>
                    </div>
                  )}
                  {review.goals && (
                    <div>
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Obiettivi</p>
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{review.goals}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
