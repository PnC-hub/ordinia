'use client'

import { useState, useEffect } from 'react'

export default function AcknowledgmentsPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/manual/articles?status=PUBLISHED').then(r => r.json()).then(data => {
      const list = Array.isArray(data) ? data : data.articles || []
      setArticles(list)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6"><div className="animate-pulse h-8 bg-gray-200 rounded w-48"></div></div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">📋 Registro Prese Visione</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Monitoraggio della lettura degli articoli da parte del personale</p>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Articolo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Categoria</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Prese Visione</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Stato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {articles.map(a => {
              const ackCount = a._count?.acknowledgments || 0
              return (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{a.title}</td>
                  <td className="px-4 py-3 text-gray-500">{a.category?.name || '-'}</td>
                  <td className="px-4 py-3 text-center">{ackCount}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${ackCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {ackCount > 0 ? 'Confermato' : 'In attesa'}
                    </span>
                  </td>
                </tr>
              )
            })}
            {articles.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Nessun articolo pubblicato</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
