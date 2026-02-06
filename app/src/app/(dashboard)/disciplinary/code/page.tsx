'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DisciplinaryCode {
  id: string
  tenantId: string
  version: string
  content: string
  postedAt: string | null
  postedBy: string | null
  postedLocation: string | null
  photoPath: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CodeAcknowledgment {
  id: string
  acknowledgedAt: string
  method: string
  employee: {
    id: string
    firstName: string
    lastName: string
    department: string | null
  }
}

export default function DisciplinaryCodePage() {
  const [codes, setCodes] = useState<DisciplinaryCode[]>([])
  const [acknowledgments, setAcknowledgments] = useState<CodeAcknowledgment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'codes' | 'acknowledgments'>('codes')

  useEffect(() => {
    async function fetchData() {
      try {
        const [codesRes, acksRes] = await Promise.all([
          fetch('/api/disciplinary-code'),
          fetch('/api/disciplinary-code/acknowledgments'),
        ])

        if (codesRes.ok) {
          const codesData = await codesRes.json()
          // L'API restituisce un singolo oggetto o null, converti in array
          if (codesData) {
            setCodes([codesData])
          } else {
            setCodes([])
          }
        }

        if (acksRes.ok) {
          const acksData = await acksRes.json()
          // Verifica che sia un array
          setAcknowledgments(Array.isArray(acksData) ? acksData : [])
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

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateStr))
  }

  const activeCode = codes.find((c) => c.isActive)

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Link href="/disciplinary" className="hover:text-blue-600">Disciplinare</Link>
            <span>/</span>
            <span>Codice</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Codice Disciplinare
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestione affissione e prese visione del codice disciplinare
          </p>
        </div>
        <Link
          href="/disciplinary/code/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Carica Nuovo Codice
        </Link>
      </div>

      {/* Active Code Card */}
      {activeCode && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-2xl font-bold">C</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Codice Disciplinare v{activeCode.version}
                  </h2>
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                    Attivo
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Versione {activeCode.version} - Creato il {formatDate(activeCode.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {acknowledgments.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Prese visione</p>
            </div>
          </div>

          {/* Affissione Status */}
          <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeCode.postedAt ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {activeCode.postedAt ? '✓' : '○'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Affissione</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activeCode.postedAt ? (
                    <>
                      {formatDateTime(activeCode.postedAt)}
                      {activeCode.postedLocation && ` - ${activeCode.postedLocation}`}
                    </>
                  ) : (
                    'Non affisso'
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeCode.photoPath ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {activeCode.photoPath ? '✓' : '○'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Foto Affissione</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activeCode.photoPath ? 'Documentata' : 'Non caricata'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-700 dark:text-blue-300 text-sm">i</span>
          </div>
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
              Obblighi di Affissione
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Art. 7 L. 300/1970: Il codice disciplinare deve essere affisso in luogo accessibile a tutti i lavoratori
              e portato a conoscenza mediante pubblicità. La foto dell&apos;affissione documenta l&apos;adempimento dell&apos;obbligo.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-zinc-700">
        <button
          onClick={() => setActiveTab('codes')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'codes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Versioni Codice
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
      ) : activeTab === 'codes' ? (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Versione
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Data Creazione
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Affissione
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Stato
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                {codes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Nessun codice disciplinare caricato
                    </td>
                  </tr>
                ) : (
                  codes.map((code) => (
                    <tr key={code.id} className="hover:bg-gray-50 dark:hover:bg-zinc-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        v{code.version}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(code.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {code.postedAt ? (
                          <span className="text-green-600 dark:text-green-400">
                            {formatDate(code.postedAt)}
                          </span>
                        ) : (
                          <span className="text-gray-400">Non affisso</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            code.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {code.isActive ? 'Attivo' : 'Archiviato'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
                    Data Presa Visione
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Metodo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                {acknowledgments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(ack.acknowledgedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          {ack.method === 'DIGITAL' ? 'Digitale' :
                           ack.method === 'PAPER' ? 'Cartaceo' :
                           ack.method === 'EMAIL' ? 'Email' : ack.method}
                        </span>
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
