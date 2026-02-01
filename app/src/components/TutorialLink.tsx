'use client'

import Link from 'next/link'
import { tutorials } from '@/lib/tutorialData'

interface TutorialLinkProps {
  tutorialId: string
  className?: string
  variant?: 'default' | 'compact' | 'banner'
}

export default function TutorialLink({
  tutorialId,
  className = '',
  variant = 'default',
}: TutorialLinkProps) {
  const tutorial = tutorials.find((t) => t.id === tutorialId)

  if (!tutorial) return null

  if (variant === 'compact') {
    return (
      <Link
        href={`/tutorials/${tutorialId}`}
        className={`inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 ${className}`}
      >
        <span className="text-base">{tutorial.icon}</span>
        <span>Guida: {tutorial.title}</span>
        <span className="text-xs text-gray-500">({tutorial.duration})</span>
      </Link>
    )
  }

  if (variant === 'banner') {
    return (
      <Link
        href={`/tutorials/${tutorialId}`}
        className={`block bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors ${className}`}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl flex-shrink-0">
            {tutorial.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {tutorial.title}
              </h4>
              <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                {tutorial.duration}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {tutorial.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              <span>📚 {tutorial.sections.length} sezioni</span>
              <span>•</span>
              <span>Inizia il tutorial →</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Default variant
  return (
    <Link
      href={`/tutorials/${tutorialId}`}
      className={`flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors ${className}`}
    >
      <span className="text-2xl">{tutorial.icon}</span>
      <div className="flex-1">
        <div className="font-medium text-gray-900 dark:text-white text-sm">
          {tutorial.title}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {tutorial.sections.length} sezioni • {tutorial.duration}
        </div>
      </div>
      <span className="text-blue-600 dark:text-blue-400 text-sm">→</span>
    </Link>
  )
}
