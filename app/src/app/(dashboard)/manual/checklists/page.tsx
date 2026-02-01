'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const FREQ_LABELS: Record<string, string> = { DAILY: 'Giornaliera', WEEKLY: 'Settimanale', MONTHLY: 'Mensile', QUARTERLY: 'Trimestrale', ANNUAL: 'Annuale', ON_DEMAND: 'Su richiesta' }
const FREQ_COLORS: Record<string, string> = { DAILY: 'bg-red-100 text-red-800', WEEKLY: 'bg-orange-100 text-orange-800', MONTHLY: 'bg-blue-100 text-blue-800', ON_DEMAND: 'bg-gray-100 text-gray-800' }

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/manual/checklists').then(r => r.json()).then(data => setChecklists(Array.isArray(data) ? data : [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6"><div className="animate-pulse h-8 bg-gray-200 rounded w-48"></div></div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">☑️ Checklist Operative</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestisci e completa le checklist dello studio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {checklists.map(cl => (
          <div key={cl.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">{cl.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs ${FREQ_COLORS[cl.frequency] || FREQ_COLORS.ON_DEMAND}`}>
                {FREQ_LABELS[cl.frequency] || cl.frequency}
              </span>
            </div>
            {cl.description && <p className="text-sm text-gray-500 mb-3">{cl.description}</p>}
            <div className="text-xs text-gray-400 mb-4">
              {cl.items?.length || 0} items • {cl._count?.executions || 0} esecuzioni
              {cl.executions?.[0] && <span> • Ultima: {new Date(cl.executions[0].executedAt).toLocaleDateString('it-IT')}</span>}
            </div>
            <div className="flex gap-2">
              <Link href={`/manual/checklists/${cl.id}/execute`} className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Esegui
              </Link>
              <Link href={`/manual/checklists/${cl.id}`} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                Dettagli
              </Link>
            </div>
          </div>
        ))}
        {checklists.length === 0 && <p className="text-gray-400 col-span-3">Nessuna checklist configurata</p>}
      </div>
    </div>
  )
}
