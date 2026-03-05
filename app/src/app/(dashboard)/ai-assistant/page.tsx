'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import BrainDrawer, { type BrainMsg, type BrainConv, type ManualDraft } from '@/components/brain/BrainDrawer'

export default function BrainAIPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER'

  const [isOpen, setIsOpen] = useState(true)
  const [messages, setMessages] = useState<BrainMsg[]>([])
  const [conversations, setConversations] = useState<BrainConv[]>([])
  const [currentConvId, setCurrentConvId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState('')

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/conversations')
      if (res.ok) setConversations(await res.json())
    } catch { /* silently fail */ }
  }, [])

  useEffect(() => { loadConversations() }, [loadConversations])

  async function loadConversation(id: string) {
    try {
      const res = await fetch(`/api/ai/conversations/${id}`)
      if (!res.ok) return
      const data = await res.json()
      setCurrentConvId(id)
      setMessages(data.messages.map((m: { id: string; role: 'user' | 'assistant'; content: string; createdAt: string }) => ({
        id: m.id, role: m.role, content: m.content, timestamp: new Date(m.createdAt),
      })))
    } catch { /* silently fail */ }
  }

  async function deleteConversation(id: string) {
    await fetch(`/api/ai/conversations/${id}`, { method: 'DELETE' })
    if (currentConvId === id) { setCurrentConvId(null); setMessages([]) }
    await loadConversations()
  }

  function newConversation() {
    setCurrentConvId(null)
    setMessages([])
    setError(null)
  }

  async function handleSend(opts?: { mode?: string }) {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: BrainMsg = {
      id: `tmp-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationId: currentConvId, mode: opts?.mode }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Errore nella risposta')
        return
      }

      if (data.conversationId && !currentConvId) {
        setCurrentConvId(data.conversationId)
        await loadConversations()
      }

      const aiMsg: BrainMsg = {
        id: data.messageId || `ai-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  async function handleManualSave(draft: ManualDraft) {
    const res = await fetch('/api/ai/manual-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error ?? 'Errore durante il salvataggio')
    }
    setMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: `✅ Salvato nel manuale!\n\n**${data.article.title}** aggiunto alla categoria **${data.article.categoryName}**.\n\nVisibile in [Manuale Aziendale](/manual).`,
        timestamp: new Date(),
      }
    ])
  }

  return (
    <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <span className="text-2xl">🧠</span>
          <div className="text-left">
            <p className="font-bold">Apri Brain AI</p>
            <p className="text-sm text-violet-200">HR & Sicurezza Assistant</p>
          </div>
        </button>
      )}

      <BrainDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        conversations={conversations}
        currentConvId={currentConvId}
        loading={loading}
        error={error}
        input={input}
        onInputChange={setInput}
        onSend={handleSend}
        onNewConversation={newConversation}
        onLoadConversation={loadConversation}
        onDeleteConversation={deleteConversation}
        isAdmin={isAdmin}
        onManualSave={handleManualSave}
      />
    </div>
  )
}
