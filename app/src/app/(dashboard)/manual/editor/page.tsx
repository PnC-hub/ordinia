'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewArticlePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/manual/categories').then(r => r.json()).then(cats => {
      const flat: any[] = []
      ;(Array.isArray(cats) ? cats : []).forEach((c: any) => {
        flat.push(c)
        c.children?.forEach((ch: any) => flat.push({ ...ch, name: `${c.name} / ${ch.name}` }))
      })
      setCategories(flat)
    })
  }, [])

  const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleSave = async (status: string) => {
    setError('')

    // Validazione frontend
    if (!title.trim()) {
      setError('Il titolo è obbligatorio')
      return
    }
    if (!categoryId) {
      setError('Seleziona una categoria')
      return
    }
    if (!content.trim()) {
      setError('Il contenuto è obbligatorio')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/manual/articles', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug: slug || generateSlug(title), content, categoryId, status })
      })
      if (res.ok) {
        router.push('/manual')
      } else {
        const data = await res.json()
        setError(data.error || 'Errore durante il salvataggio')
      }
    } catch (err) {
      setError('Errore di connessione')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">✏️ Nuovo Articolo</h1>
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Titolo <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={e => { setTitle(e.target.value); setSlug(generateSlug(e.target.value)) }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Titolo articolo" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Slug</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Categoria <span className="text-red-500">*</span></label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">Seleziona categoria</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {categories.length === 0 && (
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  Nessuna categoria disponibile. Crea prima una categoria dal menu Manuale.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Contenuto (Markdown) <span className="text-red-500">*</span></label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={20}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm"
                placeholder="# Titolo&#10;&#10;Contenuto..." />
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <button onClick={() => handleSave('DRAFT')} disabled={saving} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-white">
              Salva Bozza
            </button>
            <button onClick={() => handleSave('PUBLISHED')} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Pubblica
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Anteprima</h3>
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{content || 'Inizia a scrivere per vedere l\'anteprima...'}</div>
        </div>
      </div>
    </div>
  )
}
