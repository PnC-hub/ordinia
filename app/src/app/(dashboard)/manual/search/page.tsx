'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ManualSearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/manual/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } finally { setLoading(false) }
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🔍 Cerca nel Manuale</h1>

      <div className="flex gap-3 mb-6">
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Cerca articoli, procedure, protocolli..."
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-lg" />
        <button onClick={handleSearch} disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          {loading ? '...' : 'Cerca'}
        </button>
      </div>

      {searched && !loading && (
        <p className="text-sm text-gray-500 mb-4">{results.length} risultat{results.length === 1 ? 'o' : 'i'} per &quot;{query}&quot;</p>
      )}

      <div className="space-y-4">
        {results.map(article => (
          <Link key={article.id} href={`/manual/${article.category?.slug || 'uncategorized'}/${article.slug}`}
            className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition">
            <h3 className="font-semibold text-gray-900 dark:text-white">{article.title}</h3>
            {article.category && <span className="text-xs text-blue-600">{article.category.name}</span>}
            {article.content && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{article.content.substring(0, 200)}...</p>
            )}
          </Link>
        ))}
        {searched && !loading && results.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nessun risultato trovato</p>
        )}
      </div>
    </div>
  )
}
