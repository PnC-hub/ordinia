'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ManualDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/manual/dashboard').then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6"><div className="animate-pulse h-8 bg-gray-200 rounded w-48 mb-6"></div></div>

  const stats = data?.stats || {}

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Manuale Operativo</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestisci documenti, procedure e checklist aziendali</p>
        </div>
        <Link href="/manual/editor" className="bg-blue-600 text-white rounded-lg hover:bg-blue-700 px-6 py-2">
          + Nuovo Articolo
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Totale Articoli', value: stats.totalArticles || 0, icon: '📚', color: 'blue' },
          { label: '% Letti dal Team', value: `${stats.acknowledgmentRate || 0}%`, icon: '📖', color: stats.acknowledgmentRate >= 80 ? 'green' : 'yellow' },
          { label: 'Checklist', value: stats.totalChecklists || 0, icon: '☑️', color: 'purple' },
          { label: 'Pubblicati', value: stats.publishedArticles || 0, icon: '✅', color: 'green' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-${kpi.color}-100 dark:bg-${kpi.color}-900/20 rounded-lg flex items-center justify-center text-2xl`}>
                {kpi.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Articoli Recenti</h2>
          <div className="space-y-3">
            {(data?.recentArticles || []).slice(0, 5).map((article: any) => (
              <Link key={article.id} href={`/manual/${article.category?.slug}/${article.slug}`}
                className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <p className="font-medium text-gray-900 dark:text-white">{article.title}</p>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">{article.category?.name}</span>
                  <span className="text-xs text-gray-400">{new Date(article.updatedAt).toLocaleDateString('it-IT')}</span>
                </div>
              </Link>
            ))}
            {(!data?.recentArticles?.length) && <p className="text-gray-400 text-sm">Nessun articolo ancora</p>}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Categorie Principali</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Clinica', slug: 'clinica', icon: '🏥', desc: 'Procedure e protocolli clinici' },
              { name: 'Corporate', slug: 'corporate', icon: '🏢', desc: 'Gestione aziendale' },
              { name: 'Sistema Documentale', slug: 'sistema-documentale', icon: '📁', desc: 'Registro documenti e revisioni' },
              { name: 'Privacy e GDPR', slug: 'generali', icon: '🔒', desc: 'Informativa e consensi' },
              { name: 'Checklist', slug: '../manual/checklists', icon: '☑️', desc: 'Checklist operative' },
              { name: 'Ricerca', slug: '../manual/search', icon: '🔍', desc: 'Cerca nel manuale' },
            ].map((cat) => (
              <Link key={cat.slug} href={`/manual/${cat.slug}`}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <span className="text-2xl block mb-2">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>
                <p className="text-xs text-gray-500 mt-1">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
