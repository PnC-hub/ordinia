'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface ExpenseRequest {
  id: string
  category: string
  status: string
  amount: number
  description: string
  receiptUrl: string | null
  date: string
  createdAt: string
  reviewedAt: string | null
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string
    department: string | null
  }
  reviewer: {
    id: string
    name: string
  } | null
}

const categoryLabels: Record<string, string> = {
  TRAVEL: 'Viaggio',
  MEALS: 'Pasti',
  ACCOMMODATION: 'Alloggio',
  EQUIPMENT: 'Attrezzature',
  SOFTWARE: 'Software',
  TRAINING: 'Formazione',
  OFFICE: 'Ufficio',
  OTHER: 'Altro',
}

const categoryColors: Record<string, string> = {
  TRAVEL: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  MEALS: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  ACCOMMODATION: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  EQUIPMENT: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  SOFTWARE: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  TRAINING: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  OFFICE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  OTHER: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

const statusLabels: Record<string, string> = {
  PENDING: 'In attesa',
  APPROVED: 'Approvata',
  REJECTED: 'Rifiutata',
  REIMBURSED: 'Rimborsata',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  REIMBURSED: 'bg-blue-100 text-blue-700',
}

export default function ExpensesManagementPage() {
  const [expenses, setExpenses] = useState<ExpenseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

  useEffect(() => {
    fetchExpenses()
  }, [filter])

  async function fetchExpenses() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter === 'pending') params.set('status', 'PENDING')
      if (filter === 'approved') params.set('status', 'APPROVED')

      const res = await fetch(`/api/expenses?${params}`)
      if (res.ok) {
        const data = await res.json()
        setExpenses(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(id: string) {
    try {
      const res = await fetch(`/api/expenses/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      if (!res.ok) throw new Error("Errore nell'approvazione")
      fetchExpenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  async function handleReject(id: string) {
    const reason = prompt('Motivo del rifiuto:')
    if (!reason) return

    try {
      const res = await fetch(`/api/expenses/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason }),
      })
      if (!res.ok) throw new Error('Errore nel rifiuto')
      fetchExpenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  async function handleMarkReimbursed(id: string) {
    try {
      const res = await fetch(`/api/expenses/${id}/reimburse`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Errore nel rimborso')
      fetchExpenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  // Stats
  const pendingCount = expenses.filter((e) => e.status === 'PENDING').length
  const approvedCount = expenses.filter((e) => e.status === 'APPROVED').length
  const pendingTotal = expenses
    .filter((e) => e.status === 'PENDING')
    .reduce((sum, e) => sum + e.amount, 0)
  const approvedTotal = expenses
    .filter((e) => e.status === 'APPROVED' || e.status === 'REIMBURSED')
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Spese e Rimborsi
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestisci note spese e richieste di rimborso
            </p>
          </div>
          <PageInfoTooltip
            title="Gestione Note Spese"
            description="Visualizza e approva le richieste di rimborso spese dei collaboratori. Ogni richiesta include documentazione allegata e viene tracciata fino al rimborso effettivo."
            tips={[
              'Verifica sempre che sia allegata la ricevuta originale',
              'Controlla i limiti di spesa per categoria',
              'Segna le spese come rimborsate dopo il pagamento'
            ]}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Totale Richieste
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {expenses.length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Da Approvare</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-gray-500">{formatCurrency(pendingTotal)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Approvate</p>
          <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-sm text-gray-500">{formatCurrency(approvedTotal)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Importo Medio
          </p>
          <p className="text-3xl font-bold text-blue-600">
            {expenses.length > 0
              ? formatCurrency(
                  expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length
                )
              : '€0'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300'
          }`}
        >
          Tutte
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300'
          }`}
        >
          Da Approvare ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300'
          }`}
        >
          Approvate
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-900">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Dipendente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Descrizione
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Importo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Caricamento...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nessuna nota spese trovata
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-750"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {exp.employee.firstName} {exp.employee.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {exp.employee.department || exp.employee.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          categoryColors[exp.category] || categoryColors.OTHER
                        }`}
                      >
                        {categoryLabels[exp.category] || exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {exp.description}
                      </p>
                      {exp.receiptUrl && (
                        <a
                          href={exp.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Vedi ricevuta
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(exp.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(exp.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          statusColors[exp.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusLabels[exp.status] || exp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {exp.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(exp.id)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Approva
                            </button>
                            <button
                              onClick={() => handleReject(exp.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Rifiuta
                            </button>
                          </>
                        )}
                        {exp.status === 'APPROVED' && (
                          <button
                            onClick={() => handleMarkReimbursed(exp.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Segna Rimborsato
                          </button>
                        )}
                        <Link
                          href={`/expenses/${exp.id}`}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Dettagli
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
