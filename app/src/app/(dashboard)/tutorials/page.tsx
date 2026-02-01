'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageInfoTooltip from '@/components/PageInfoTooltip'
import { tutorials, getAllCategories, type TutorialCategory } from '@/lib/tutorialData'

interface TutorialProgress {
  tutorialId: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  progressPercent: number
  currentSection: number
  totalSections: number
  completedAt?: string
  lastViewedAt?: string
}

export default function TutorialsPage() {
  const [selectedCategory, setSelectedCategory] = useState<TutorialCategory | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [progressMap, setProgressMap] = useState<Record<string, TutorialProgress>>({})
  const [loading, setLoading] = useState(true)

  const categories = getAllCategories()

  useEffect(() => {
    fetchProgress()
  }, [])

  async function fetchProgress() {
    try {
      const res = await fetch('/api/tutorials/progress')
      if (res.ok) {
        const data: TutorialProgress[] = await res.json()
        const map: Record<string, TutorialProgress> = {}
        data.forEach((p) => {
          map[p.tutorialId] = p
        })
        setProgressMap(map)
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesCategory = !selectedCategory || tutorial.category === selectedCategory
    const matchesSearch =
      !searchQuery ||
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const stats = {
    total: tutorials.length,
    completed: Object.values(progressMap).filter((p) => p.status === 'COMPLETED').length,
    inProgress: Object.values(progressMap).filter((p) => p.status === 'IN_PROGRESS').length,
    totalSections: tutorials.reduce((acc, t) => acc + t.sections.length, 0),
  }

  const getStatusBadge = (tutorialId: string) => {
    const progress = progressMap[tutorialId]
    if (!progress || progress.status === 'NOT_STARTED') {
      return (
        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400 rounded">
          Non iniziato
        </span>
      )
    }
    if (progress.status === 'COMPLETED') {
      return (
        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded flex items-center gap-1">
          <span>✓</span>
          Completato
        </span>
      )
    }
    return (
      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
        {progress.progressPercent}% completato
      </span>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Centro Tutorial
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Guide pratiche per utilizzare al meglio GeniusHR
            </p>
          </div>
          <PageInfoTooltip
            title="Centro Tutorial"
            description="Qui trovi tutorial interattivi per imparare a utilizzare tutte le funzionalità di GeniusHR. Ogni guida include esempi pratici, suggerimenti operativi e checklist."
            tips={[
              'Inizia dai tutorial base se sei un nuovo utente',
              'Il tuo progresso viene salvato automaticamente',
              'Consulta i tutorial specifici quando hai dubbi su una funzionalità',
              'I suggerimenti pratici ti aiutano ad evitare errori comuni',
            ]}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tutorial Disponibili</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completati</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Corso</p>
          <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sezioni Totali</p>
          <p className="text-3xl font-bold text-purple-600">{stats.totalSections}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Cerca tutorial..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            Tutti
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Tutorials Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTutorials.map((tutorial) => {
          const progress = progressMap[tutorial.id]
          return (
            <Link
              key={tutorial.id}
              href={`/tutorials/${tutorial.id}`}
              className="bg-white dark:bg-zinc-800 rounded-xl p-5 border border-gray-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{tutorial.icon}</span>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400 rounded">
                    {tutorial.duration}
                  </span>
                  {getStatusBadge(tutorial.id)}
                </div>
              </div>

              {progress && progress.progressPercent > 0 && progress.progressPercent < 100 && (
                <div className="mb-3">
                  <div className="h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progress.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tutorial.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {tutorial.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                  {tutorial.category}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {tutorial.sections.length} sezioni
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {filteredTutorials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Nessun tutorial trovato per i filtri selezionati
          </p>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
            🤖
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Hai bisogno di aiuto personalizzato?</h3>
            <p className="text-blue-100 text-sm">
              L'assistente AI può rispondere a domande specifiche sulla gestione HR
            </p>
          </div>
          <Link
            href="/ai-assistant"
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Chiedi all'AI
          </Link>
        </div>
      </div>
    </div>
  )
}
