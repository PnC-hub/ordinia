'use client'

import { useState } from 'react'

interface PageInfoTooltipProps {
  title: string
  description: string
  tips?: string[]
}

export default function PageInfoTooltip({ title, description, tips }: PageInfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-help"
        aria-label="Informazioni pagina"
      >
        i
      </button>

      {isOpen && (
        <div className="absolute z-50 top-8 left-0 w-80 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-gray-200 dark:border-zinc-700 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
              i
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {description}
          </p>

          {tips && tips.length > 0 && (
            <div className="border-t border-gray-200 dark:border-zinc-700 pt-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Suggerimenti:
              </p>
              <ul className="space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="absolute -top-2 left-3 w-4 h-4 bg-white dark:bg-zinc-800 border-l border-t border-gray-200 dark:border-zinc-700 rotate-45" />
        </div>
      )}
    </div>
  )
}
