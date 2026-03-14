'use client'

import { useState } from 'react'

interface MediaToolbarProps {
  onInsert: (tag: string) => void
}

export default function MediaToolbar({ onInsert }: MediaToolbarProps) {
  const [activeInput, setActiveInput] = useState<'img' | 'video' | null>(null)
  const [urlValue, setUrlValue] = useState('')

  const handleOpen = (type: 'img' | 'video') => {
    setUrlValue('')
    setActiveInput(prev => (prev === type ? null : type))
  }

  const handleInsert = () => {
    if (!urlValue.trim() || !activeInput) return
    onInsert(`[${activeInput}:${urlValue.trim()}]`)
    setUrlValue('')
    setActiveInput(null)
  }

  const handleClose = () => {
    setActiveInput(null)
    setUrlValue('')
  }

  return (
    <div className="mb-2 space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleOpen('img')}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            activeInput === 'img'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white'
          }`}
        >
          📷 Immagine
        </button>
        <button
          type="button"
          onClick={() => handleOpen('video')}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            activeInput === 'video'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white'
          }`}
        >
          ▶️ Video
        </button>
      </div>

      {activeInput && (
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            URL {activeInput === 'img' ? 'immagine' : 'video'}:
          </span>
          <input
            type="url"
            value={urlValue}
            onChange={e => setUrlValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInsert()}
            placeholder="https://..."
            autoFocus
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <button
            type="button"
            onClick={handleInsert}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Inserisci
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
