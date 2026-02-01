'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { use } from 'react'

export default function ManualCategoryPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = use(params)
  const [categories, setCategories] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/manual/categories').then(r => r.json()),
      fetch(`/api/manual/articles?categorySlug=${categorySlug}`).then(r => r.json())
    ]).then(([cats, arts]) => {
      const allCats = Array.isArray(cats) ? cats : []
      const parent = allCats.find((c: any) => c.slug === categorySlug)
      setCategories(parent?.children || [])
      setArticles(arts.articles || [])
    }).finally(() => setLoading(false))
  }, [categorySlug])

  if (loading) return <div className="p-6"><div className="animate-pulse h-8 bg-gray-200 rounded w-48"></div></div>

  return (
    <div className="p-6">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/manual" className="hover:underline">Manuale</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white capitalize">{categorySlug.replace(/-/g, ' ')}</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 capitalize">{categorySlug.replace(/-/g, ' ')}</h1>

      {categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Sottocategorie</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((sub: any) => (
              <Link key={sub.id} href={`/manual/${sub.slug}`}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors">
                <h3 className="font-medium text-gray-900 dark:text-white">{sub.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{sub.description}</p>
                <span className="text-xs text-gray-400 mt-2 block">{sub._count?.articles || 0} articoli</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Articoli</h2>
        {articles.map((article: any) => (
          <Link key={article.id} href={`/manual/${categorySlug}/${article.slug}`}
            className="block p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{article.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Aggiornato il {new Date(article.updatedAt).toLocaleDateString('it-IT')}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${article.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {article.status === 'PUBLISHED' ? 'Pubblicato' : article.status}
              </span>
            </div>
          </Link>
        ))}
        {articles.length === 0 && <p className="text-gray-400">Nessun articolo in questa categoria</p>}
      </div>
    </div>
  )
}
