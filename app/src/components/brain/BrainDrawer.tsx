'use client'
import { useRef, useEffect, useState, useMemo } from 'react'
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

export interface ManualDraft {
  type: 'manual_draft'
  categoryName: string
  title: string
  content: string
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
  onSend: (opts?: { mode?: string }) => void
  onNewConversation: () => void
  onLoadConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  onManualSave?: (draft: ManualDraft) => Promise<void>
  isAdmin?: boolean
}

const SUGGESTIONS = [
  'Chi ha formazioni sicurezza in scadenza?',
  'Mostrami le scadenze urgenti del mese',
  'Genera una lettera di assunzione',
  'Quali procedure disciplinari sono aperte?',
  'Stato firme documenti pendenti',
  'Obblighi D.Lgs 81/08 per il mio settore',
]

function parseManualDraft(content: string): ManualDraft | null {
  try {
    const parsed = JSON.parse(content)
    if (
      parsed?.type === 'manual_draft' &&
      typeof parsed.categoryName === 'string' &&
      typeof parsed.title === 'string' &&
      typeof parsed.content === 'string'
    ) {
      return parsed as ManualDraft
    }
  } catch {
    // not JSON
  }
  return null
}

export default function BrainDrawer({
  isOpen, onClose, messages, conversations, currentConvId,
  loading, error, input, onInputChange, onSend,
  onNewConversation, onLoadConversation, onDeleteConversation,
  onManualSave, isAdmin = false,
}: BrainDrawerProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, loading])

  // Parse last assistant message for manual draft
  const manualDraft = useMemo(() => {
    if (!manualMode) return null
    const last = messages.filter((m) => m.role === 'assistant').at(-1)
    return last ? parseManualDraft(last.content) : null
  }, [manualMode, messages])

  const handleSend = () => {
    onSend(manualMode ? { mode: 'manual' } : undefined)
  }

  const handleManualSave = async () => {
    if (!manualDraft || !onManualSave) return
    setSavingDraft(true)
    setSaveError(null)
    try {
      await onManualSave(manualDraft)
      setManualMode(false)
    } catch {
      setSaveError('Errore durante il salvataggio. Riprova.')
    } finally {
      setSavingDraft(false)
    }
  }

  const handleToggleManual = () => {
    setSaveError(null)
    setManualMode(!manualMode)
  }

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
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Brain AI</h3>
                {isAdmin && (
                  <button
                    onClick={handleToggleManual}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      manualMode
                        ? 'bg-emerald-400 text-emerald-900'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    📖 Manuale
                  </button>
                )}
              </div>
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

        {/* Manual Mode Banner */}
        {manualMode && (
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-700 flex-shrink-0">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              📖 <strong>Modalità Manuale attiva</strong> — Dimmi la regola o il protocollo da aggiungere.
            </p>
          </div>
        )}

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
                    onClick={() => { onInputChange(s); handleSend() }}
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

        {/* Manual Draft Card */}
        {manualDraft && (
          <div className="mx-4 mb-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700 flex-shrink-0">
            <p className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2 text-sm">
              📝 Bozza articolo pronta
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
              <span className="font-medium">Categoria:</span> {manualDraft.categoryName}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
              <span className="font-medium">Titolo:</span> {manualDraft.title}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-3">
              {manualDraft.content}
            </p>
            <div className="flex gap-2">
              <button
                disabled={savingDraft}
                onClick={handleManualSave}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                {savingDraft ? 'Salvataggio...' : '✅ Salva nel Manuale'}
              </button>
              <button
                onClick={() => window.open('/manual', '_blank')}
                className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Apri il Manuale"
              >
                ✏️
              </button>
            </div>
            {saveError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">{saveError}</p>
            )}
          </div>
        )}

        {/* Input */}
        <BrainInput
          value={input}
          onChange={onInputChange}
          onSend={handleSend}
          loading={loading}
          error={error}
        />
      </div>
    </>
  )
}
