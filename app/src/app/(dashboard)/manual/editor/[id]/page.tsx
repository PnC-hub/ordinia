'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [changeNote, setChangeNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/manual/articles/${id}`).then(r => r.json()).then(a => {
      setTitle(a.title || '')
      setContent(a.content || '')
    })
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/manual/articles/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, changeNote })
      })
      router.push('/manual')
    } finally { setSaving(false) }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">✏️ Modifica Articolo</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-lg font-semibold" />
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={20}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm" />
          <input type="text" value={changeNote} onChange={e => setChangeNote(e.target.value)} placeholder="Note di revisione..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
          <div className="flex gap-4">
            <button onClick={() => router.back()} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg dark:text-white">Annulla</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salva Modifiche</button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Anteprima</h3>
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{content}</div>
        </div>
      </div>
    </div>
  )
}
