'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DvrAcknowledgment {
  id: string
  documentTitle: string
  documentVersion: string
  acknowledgedAt: string
  signedAt: string | null
  signaturePath: string | null
  employee: {
    id: string
    firstName: string
    lastName: string
    department: string | null
  }
}

interface DvrDocument {
  id: string
  title: string
  version: string
  validFrom: string
  validUntil: string | null
  filePath: string
  isActive: boolean
  _count: {
    acknowledgments: number
  }
}

export default function DvrPage() {
  const [documents, setDocuments] = useState<DvrDocument[]>([])
  const [acknowledgments, setAcknowledgments] = useState<DvrAcknowledgment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'documents' | 'acknowledgments'>('documents')

  useEffect(() => {
    async function fetchData() {
      try {
        const [docsRes, acksRes] = await Promise.all([
          fetch('/api/dvr/documents'),
          fetch('/api/dvr'),
        ])

        if (docsRes.ok) {
          const docsData = await docsRes.json()
          setDocuments(docsData)
        }

        if (acksRes.ok) {
          const acksData = await acksRes.json()
          // Transform acknowledgments data to match expected interface
          const transformedAcks = acksData.map((ack: {
            id: string
            dvrVersion: string
            acknowledgedAt: string | null
            signature: string | null
            employee: {
              id: string
              firstName: string
              lastName: string
              department: string | null
            }
          }) => ({
            id: ack.id,
            documentTitle: 'DVR',
            documentVersion: ack.dvrVersion,
            acknowledgedAt: ack.acknowledgedAt,
            signedAt: ack.signature ? ack.acknowledgedAt : null,
            signaturePath: ack.signature,
            employee: ack.employee,
          }))
          setAcknowledgments(transformedAcks)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'medium',
    }).format(new Date(dateStr))
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Link href="/safety" className="hover:text-blue-600">Sicurezza</Link>
            <span>/</span>
            <span>DVR</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            DVR - Documento Valutazione Rischi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestione documenti DVR e prese visione dipendenti
          </p>
        </div>
        <Link
          href="/safety/dvr/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Carica DVR
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-zinc-700">
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'documents'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Documenti DVR
        </button>
        <button
          onClick={() => setActiveTab('acknowledgments')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'acknowledgments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Prese Visione
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Caricamento...</div>
      ) : activeTab === 'documents' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700">
              Nessun documento DVR caricato
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                    <span className="text-amber-600 dark:text-amber-400 text-lg">!</span>
                  </div>
                  {doc.isActive && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                      Attivo
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  {doc.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Versione {doc.version}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Valido dal {formatDate(doc.validFrom)}
                  </span>
                  <span className="font-medium text-blue-600">
                    {doc._count.acknowledgments} prese visione
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Dipendente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Data Presa Visione
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Firma
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                {acknowledgments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Nessuna presa visione registrata
                    </td>
                  </tr>
                ) : (
                  acknowledgments.map((ack) => (
                    <tr key={ack.id} className="hover:bg-gray-50 dark:hover:bg-zinc-750">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {ack.employee.firstName} {ack.employee.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {ack.employee.department || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {ack.documentTitle} v{ack.documentVersion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(ack.acknowledgedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ack.signedAt ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                            Firmato
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                            In attesa firma
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
