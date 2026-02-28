'use client'
import { useRef, useEffect, useState } from 'react'
import BrainMessage from './BrainMessage'
import BrainInput from './BrainInput'

export interface BrainMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface BrainConv {
  id: string
  title: string
  messageCount: number
  updatedAt: string
}

interface BrainDrawerProps {
  isOpen: boolean
  onClose: () => void
  messages: BrainMsg[]
  conversations: BrainConv[]
  currentConvId: string | null
  loading: boolean
  error: string | null
  input: string
  onInputChange: (v: string) => void
  onSend: () => void
  onNewConversation: () => void
  onLoadConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
}

const SUGGESTIONS = [
  'Chi ha formazioni sicurezza in scadenza?',
  'Mostrami le scadenze urgenti del mese',
  'Genera una lettera di assunzione',
  'Quali procedure disciplinari sono aperte?',
  'Stato firme documenti pendenti',
  'Obblighi D.Lgs 81/08 per il mio settore',
]

export default function BrainDrawer({
  isOpen, onClose, messages, conversations, currentConvId,
  loading, error, input, onInputChange, onSend,
  onNewConversation, onLoadConversation, onDeleteConversation,
}: BrainDrawerProps) {
  const [showHistory, setShowHistory] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, loading])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full z-50 bg-white dark:bg-zinc-900 shadow-2xl flex flex-col"
        style={{ width: 560, maxWidth: '90vw' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
              🧠
            </div>
            <div>
              <h3 className="font-bold text-base">Brain AI</h3>
              <p className="text-violet-200 text-xs">HR &amp; Sicurezza Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors text-sm"
              title="Storico conversazioni"
            >
              🕐
            </button>
            <button
              onClick={onNewConversation}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors text-sm"
              title="Nuova conversazione"
            >
              ✚
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="border-b border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 max-h-64 overflow-y-auto flex-shrink-0">
            <div className="p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Conversazioni recenti</p>
              {conversations.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">Nessuna conversazione precedente</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-700 cursor-pointer group transition-colors ${
                      currentConvId === conv.id ? 'bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700' : ''
                    }`}
                    onClick={() => { onLoadConversation(conv.id); setShowHistory(false) }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-200 truncate">{conv.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(conv.updatedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} · {conv.messageCount} msg
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id) }}
                      className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all text-xs"
                    >
                      🗑
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={messagesRef} className="flex-1 overflow-y-auto p-5 space-y-1">
          {messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                🧠
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Ciao! Sono Brain AI</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Posso analizzare la situazione aziendale, rispondere su sicurezza, HR e protocolli, e generare documenti pronti all&apos;uso.
              </p>
              <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { onInputChange(s); onSend() }}
                    className="text-left text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all text-slate-600 dark:text-slate-300"
                  >
                    💡 {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <BrainMessage key={msg.id} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
              ))}
              {loading && (
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 text-sm">
                    🧠
                  </div>
                  <div className="bg-slate-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <BrainInput
          value={input}
          onChange={onInputChange}
          onSend={onSend}
          loading={loading}
          error={error}
        />
      </div>
    </>
  )
}
