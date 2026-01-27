'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface Document {
  id: string
  name: string
  type: string
  category: string | null
  filePath: string
  fileSize: number | null
  mimeType: string | null
  expiresAt: string | null
  createdAt: string
  employee: {
    id: string
    firstName: string
    lastName: string
  } | null
}

const typeLabels: Record<string, string> = {
  CONTRACT: 'Contratto',
  ID_DOCUMENT: 'Documento Identità',
  TRAINING_CERTIFICATE: 'Attestato Formazione',
  MEDICAL_CERTIFICATE: 'Certificato Medico',
  DPI_RECEIPT: 'Consegna DPI',
  PAYSLIP: 'Busta Paga',
  DISCIPLINARY: 'Disciplinare',
  GDPR_CONSENT: 'Consenso GDPR',
  OTHER: 'Altro',
}

const typeColors: Record<string, string> = {
  CONTRACT: 'bg-blue-100 text-blue-700',
  ID_DOCUMENT: 'bg-purple-100 text-purple-700',
  TRAINING_CERTIFICATE: 'bg-green-100 text-green-700',
  MEDICAL_CERTIFICATE: 'bg-red-100 text-red-700',
  DPI_RECEIPT: 'bg-orange-100 text-orange-700',
  PAYSLIP: 'bg-yellow-100 text-yellow-700',
  DISCIPLINARY: 'bg-gray-100 text-gray-700',
  GDPR_CONSENT: 'bg-teal-100 text-teal-700',
  OTHER: 'bg-gray-100 text-gray-500',
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const params = new URLSearchParams()
        if (filter) params.set('type', filter)

        const res = await fetch(`/api/documents?${params}`)
        if (!res.ok) throw new Error('Errore nel caricamento')
        const data = await res.json()
        setDocuments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }
    fetchDocuments()
  }, [filter])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'medium',
    }).format(new Date(dateStr))
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Group by type for stats
  const typeCounts = documents.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const expiringDocs = documents.filter((d) => {
    if (!d.expiresAt) return false
    const daysUntilExpiry = Math.ceil(
      (new Date(d.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30
  })

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Documenti
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Archivio documenti dipendenti e aziendali
            </p>
          </div>
          <PageInfoTooltip
            title="Archivio Documenti"
            description="Conserva tutti i documenti HR in un unico archivio sicuro e organizzato. Ogni documento può essere associato a un dipendente e categorizzato per tipologia."
            tips={[
              'I documenti con scadenza vengono evidenziati automaticamente',
              'Usa le categorie per filtrare rapidamente',
              'I file sono crittografati e conformi al GDPR'
            ]}
          />
        </div>
        <Link
          href="/documents/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Carica Documento
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => setFilter('')}
          className={`bg-white dark:bg-zinc-800 rounded-lg p-4 border cursor-pointer transition-colors ${
            !filter ? 'border-blue-500' : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Totale</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {documents.length}
          </p>
        </div>
        <div
          onClick={() => setFilter('CONTRACT')}
          className={`bg-white dark:bg-zinc-800 rounded-lg p-4 border cursor-pointer transition-colors ${
            filter === 'CONTRACT' ? 'border-blue-500' : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Contratti</p>
          <p className="text-2xl font-bold text-blue-600">
            {typeCounts['CONTRACT'] || 0}
          </p>
        </div>
        <div
          onClick={() => setFilter('TRAINING_CERTIFICATE')}
          className={`bg-white dark:bg-zinc-800 rounded-lg p-4 border cursor-pointer transition-colors ${
            filter === 'TRAINING_CERTIFICATE' ? 'border-green-500' : 'border-gray-200 dark:border-zinc-700 hover:border-green-300'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Attestati</p>
          <p className="text-2xl font-bold text-green-600">
            {typeCounts['TRAINING_CERTIFICATE'] || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Scadenza</p>
          <p className="text-2xl font-bold text-amber-600">
            {expiringDocs.length}
          </p>
        </div>
      </div>

      {/* Filter by Type */}
      <div className="mb-6 flex flex-wrap gap-2">
        {Object.entries(typeLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? '' : key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filter === key
                ? typeColors[key]
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-700 dark:text-gray-300'
            }`}
          >
            {label} ({typeCounts[key] || 0})
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Dipendente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Dimensione
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Scadenza
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Caricato
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Caricamento...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nessun documento trovato
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const isExpiring =
                    doc.expiresAt &&
                    Math.ceil(
                      (new Date(doc.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    ) <= 30

                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-gray-50 dark:hover:bg-zinc-750 ${
                        isExpiring ? 'bg-amber-50 dark:bg-amber-900/10' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-gray-500 text-xs">
                            {doc.mimeType?.includes('pdf') ? 'PDF' : 'DOC'}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {doc.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            typeColors[doc.type] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {typeLabels[doc.type] || doc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {doc.employee
                          ? `${doc.employee.firstName} ${doc.employee.lastName}`
                          : 'Aziendale'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(doc.fileSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {doc.expiresAt ? (
                          <span className={isExpiring ? 'text-amber-600 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                            {formatDate(doc.expiresAt)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(doc.createdAt)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
