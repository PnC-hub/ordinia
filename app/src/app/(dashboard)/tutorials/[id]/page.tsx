'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTutorialById, tutorials } from '@/lib/tutorialData'

interface TutorialProgress {
  tutorialId: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  progressPercent: number
  currentSection: number
  totalSections: number
}

export default function TutorialDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tutorialId = params.id as string
  const tutorial = getTutorialById(tutorialId)

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [progress, setProgress] = useState<TutorialProgress | null>(null)
  const [startTime, setStartTime] = useState<number>(Date.now())

  useEffect(() => {
    if (tutorial) {
      fetchProgress()
      setStartTime(Date.now())
    }
  }, [tutorial])

  useEffect(() => {
    if (tutorial) {
      // Save progress when section changes
      saveProgress()
    }
  }, [currentSectionIndex])

  async function fetchProgress() {
    if (!tutorial) return

    try {
      const res = await fetch(`/api/tutorials/progress?tutorialId=${tutorialId}`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.currentSection !== undefined) {
          setProgress(data)
          setCurrentSectionIndex(data.currentSection)
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  async function saveProgress(forceComplete = false) {
    if (!tutorial) return

    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    const isLastSection = currentSectionIndex === tutorial.sections.length - 1
    const status = forceComplete || isLastSection ? 'COMPLETED' : 'IN_PROGRESS'

    try {
      const res = await fetch('/api/tutorials/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorialId,
          currentSection: currentSectionIndex,
          totalSections: tutorial.sections.length,
          status,
          timeSpent,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setProgress(data)
      }
    } catch (error) {
      console.error('Error saving progress:', error)
    }

    // Reset timer for next section
    setStartTime(Date.now())
  }

  function handleNextSection() {
    if (!tutorial) return

    if (currentSectionIndex < tutorial.sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1)
    }
  }

  function handlePrevSection() {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1)
    }
  }

  async function handleComplete() {
    await saveProgress(true)
    router.push('/tutorials')
  }

  if (!tutorial) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Tutorial non trovato
          </h1>
          <Link
            href="/tutorials"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Torna ai tutorial
          </Link>
        </div>
      </div>
    )
  }

  const section = tutorial.sections[currentSectionIndex]
  const progressPercent = Math.round(
    ((currentSectionIndex + 1) / tutorial.sections.length) * 100
  )
  const isLastSection = currentSectionIndex === tutorial.sections.length - 1
  const isFirstSection = currentSectionIndex === 0

  // Find next/prev tutorials for navigation
  const currentIndex = tutorials.findIndex((t) => t.id === tutorialId)
  const nextTutorial = tutorials[currentIndex + 1]
  const prevTutorial = tutorials[currentIndex - 1]

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/tutorials"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <span>←</span>
          <span>Torna ai tutorial</span>
        </Link>
      </div>

      {/* Tutorial Header */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-4xl">{tutorial.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tutorial.title}
                </h1>
                <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                  {tutorial.category}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{tutorial.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {tutorial.duration}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {tutorial.sections.length} sezioni
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[4rem] text-right">
              {currentSectionIndex + 1} / {tutorial.sections.length}
            </span>
          </div>
        </div>

        {/* Section Content */}
        <div className="p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {section.title}
          </h2>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            {section.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tips */}
          {section.tips && section.tips.length > 0 && (
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span>
                Suggerimenti Pratici
              </h4>
              <ul className="space-y-2">
                {section.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2"
                  >
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Links */}
          {section.links && section.links.length > 0 && (
            <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
                <span className="text-xl">🔗</span>
                Link Utili
              </h4>
              <ul className="space-y-2">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-sm text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 flex items-center gap-2"
                    >
                      <span>→</span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Checklist */}
          {section.checklist && section.checklist.length > 0 && (
            <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
                <span className="text-xl">✓</span>
                Checklist
              </h4>
              <ul className="space-y-2">
                {section.checklist.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm text-purple-800 dark:text-purple-300 flex items-start gap-2"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 rounded border-purple-300 dark:border-purple-700"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-gray-200 dark:border-zinc-700">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevSection}
              disabled={isFirstSection}
              className="px-6 py-2.5 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              ← Precedente
            </button>

            {isLastSection ? (
              <button
                onClick={handleComplete}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <span>✓</span>
                <span>Completa Tutorial</span>
              </button>
            ) : (
              <button
                onClick={handleNextSection}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Successivo →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Related Tutorials */}
      {(prevTutorial || nextTutorial) && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Altri Tutorial
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {prevTutorial && (
              <Link
                href={`/tutorials/${prevTutorial.id}`}
                className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{prevTutorial.icon}</span>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      ← Tutorial precedente
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {prevTutorial.title}
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {nextTutorial && (
              <Link
                href={`/tutorials/${nextTutorial.id}`}
                className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{nextTutorial.icon}</span>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Tutorial successivo →
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {nextTutorial.title}
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
