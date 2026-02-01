'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { use } from 'react'

const FREQ_LABELS: Record<string, string> = { DAILY: 'Giornaliera', WEEKLY: 'Settimanale', MONTHLY: 'Mensile', QUARTERLY: 'Trimestrale', ANNUAL: 'Annuale', ON_DEMAND: 'Su richiesta' }

export default function ChecklistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [checklist, setChecklist] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/manual/checklists/${id}`).then(r => r.json()),
      fetch(`/api/manual/checklists/${id}/history`).then(r => r.json())
    ]).then(([cl, hist]) => {
      setChecklist(cl)
      setHistory(Array.isArray(hist) ? hist : [])
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-6"><div className="animate-pulse h-8 bg-gray-200 rounded w-48"></div></div>
  if (!checklist) return <div className="p-6"><p className="text-red-500">Checklist non trovata</p></div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/manual/checklists" className="text-blue-600 hover:underline text-sm">← Torna alle checklist</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{checklist.name}</h1>
          {checklist.description && <p className="text-gray-500 dark:text-gray-400 mt-1">{checklist.description}</p>}
          <span className="text-xs text-gray-400">{FREQ_LABELS[checklist.frequency] || checklist.frequency}</span>
        </div>
        <Link href={`/manual/checklists/${id}/execute`} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Esegui Checklist
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items ({checklist.items?.length || 0})</h2>
          <div className="space-y-3">
            {checklist.items?.map((item: any, i: number) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium text-gray-400 w-6">{i + 1}.</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                  {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                  {item.required && <span className="text-xs text-red-500">Obbligatorio</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storico Esecuzioni</h2>
          {history.length === 0 ? (
            <p className="text-gray-400 text-sm">Nessuna esecuzione registrata</p>
          ) : (
            <div className="space-y-3">
              {history.map((exec: any) => (
                <div key={exec.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {exec.executor?.firstName} {exec.executor?.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(exec.executedAt).toLocaleString('it-IT')}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${exec.completionRate >= 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {Math.round(exec.completionRate)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
