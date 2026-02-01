'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import Link from 'next/link'

export default function ExecuteChecklistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [checklist, setChecklist] = useState<any>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/manual/checklists/${id}`).then(r => r.json()).then(cl => {
      setChecklist(cl)
      const initial: Record<string, boolean> = {}
      cl.items?.forEach((item: any) => { initial[item.id] = false })
      setChecked(initial)
    }).finally(() => setLoading(false))
  }, [id])

  const toggle = (itemId: string) => setChecked(prev => ({ ...prev, [itemId]: !prev[itemId] }))

  const completedCount = Object.values(checked).filter(Boolean).length
  const totalCount = checklist?.items?.length || 0
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const items = Object.entries(checked).map(([itemId, completed]) => ({ itemId, completed }))
      await fetch(`/api/manual/checklists/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, notes })
      })
      router.push(`/manual/checklists/${id}`)
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="p-6"><div className="animate-pulse h-8 bg-gray-200 rounded w-48"></div></div>
  if (!checklist) return <div className="p-6"><p className="text-red-500">Checklist non trovata</p></div>

  return (
    <div className="p-6 max-w-3xl">
      <Link href={`/manual/checklists/${id}`} className="text-blue-600 hover:underline text-sm">← Torna ai dettagli</Link>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-2">{checklist.name}</h1>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">{completedCount}/{totalCount} completati</span>
          <span className={`font-semibold ${pct >= 100 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-gray-400'}`}>{pct}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div className={`h-3 rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
        {checklist.items?.map((item: any, i: number) => (
          <label key={item.id} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <input type="checkbox" checked={checked[item.id] || false} onChange={() => toggle(item.id)}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600" />
            <div>
              <p className={`text-sm font-medium ${checked[item.id] ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                {i + 1}. {item.label}
              </p>
              {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
              {item.required && <span className="text-xs text-red-500">Obbligatorio</span>}
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Note sull'esecuzione..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
      </div>

      <div className="mt-4 flex gap-4">
        <button onClick={() => router.back()} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg dark:text-white">Annulla</button>
        <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          {submitting ? 'Salvataggio...' : 'Completa Esecuzione'}
        </button>
      </div>
    </div>
  )
}
