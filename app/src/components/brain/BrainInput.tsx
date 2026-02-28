// src/components/brain/BrainInput.tsx
'use client'
import { useRef, useEffect } from 'react'

interface BrainInputProps {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  loading: boolean
  error?: string | null
}

export default function BrainInput({ value, onChange, onSend, loading, error }: BrainInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = Math.min(ref.current.scrollHeight, 128) + 'px'
    }
  }, [value])

  useEffect(() => { ref.current?.focus() }, [])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="border-t border-slate-200 dark:border-zinc-700 p-4 bg-white dark:bg-zinc-900">
      {error && (
        <p className="mb-2 text-xs text-red-500 flex items-center gap-1">
          ⚠️ {error}
        </p>
      )}
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          placeholder="Chiedi a Brain AI..."
          rows={1}
          className="flex-1 resize-none border border-slate-300 dark:border-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 max-h-32 overflow-y-auto bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
        />
        <button
          onClick={onSend}
          disabled={loading || !value.trim()}
          className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {loading ? (
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          ) : '➤'}
        </button>
      </div>
    </div>
  )
}
