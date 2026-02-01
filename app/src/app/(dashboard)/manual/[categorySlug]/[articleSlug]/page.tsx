'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { use } from 'react'

export default function ArticleViewerPage({ params }: { params: Promise<{ categorySlug: string; articleSlug: string }> }) {
  const { categorySlug, articleSlug } = use(params)
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [acked, setAcked] = useState(false)

  useEffect(() => {
    fetch(`/api/manual/articles?slug=${articleSlug}&categorySlug=${categorySlug}`)
      .then(r => r.json())
      .then(data => {
        if (data.articles?.length) setArticle(data.articles[0])
      })
      .finally(() => setLoading(false))
  }, [categorySlug, articleSlug])

  const handleAcknowledge = async () => {
    if (!article) return
    await fetch(`/api/manual/articles/${article.id}/acknowledge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    setAcked(true)
  }

  if (loading) return <div className="p-6"><div className="animate-pulse h-8 bg-gray-200 rounded w-64"></div></div>
  if (!article) return <div className="p-6"><p className="text-gray-500">Articolo non trovato</p></div>

  return (
    <div className="p-6">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/manual" className="hover:underline">Manuale</Link>
        <span className="mx-2">/</span>
        <Link href={`/manual/${categorySlug}`} className="hover:underline capitalize">{categorySlug.replace(/-/g, ' ')}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">{article.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{article.title}</h1>
              <p className="text-sm text-gray-500">
                Versione {article.version} • Aggiornato il {new Date(article.updatedAt).toLocaleDateString('it-IT')}
                {article.category && <span> • {article.category.name}</span>}
              </p>
            </div>

            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
              {article.content}
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              {acked ? (
                <div className="text-center text-green-600 dark:text-green-400 font-medium">✅ Presa visione confermata</div>
              ) : (
                <button onClick={handleAcknowledge} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  ✓ Ho letto e compreso
                </button>
              )}
            </div>

            <div className="mt-6 flex gap-4">
              <button onClick={() => window.print()} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                🖨️ Stampa
              </button>
              <Link href={`/manual/editor/${article.id}`} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                ✏️ Modifica
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sticky top-4">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Info</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Stato:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${article.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{article.status}</span></div>
              <div><span className="text-gray-500">Versione:</span> <span className="font-medium">{article.version}</span></div>
              <div><span className="text-gray-500">Letture:</span> <span className="font-medium">{article._count?.acknowledgments || 0}</span></div>
              <div><span className="text-gray-500">Revisioni:</span> <span className="font-medium">{article._count?.revisions || 0}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
