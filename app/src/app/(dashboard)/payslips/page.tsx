'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface Payslip {
  id: string
  month: number
  year: number
  grossAmount: number
  netAmount: number
  fileUrl: string | null
  status: string
  uploadedAt: string
  viewedAt: string | null
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string
    department: string | null
  }
  uploader: {
    id: string
    name: string
  }
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string | null
}

const monthNames = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
]

const statusLabels: Record<string, string> = {
  UPLOADED: 'Caricata',
  SENT: 'Inviata',
  VIEWED: 'Visualizzata',
  DOWNLOADED: 'Scaricata',
}

const statusColors: Record<string, string> = {
  UPLOADED: 'bg-gray-100 text-gray-700',
  SENT: 'bg-blue-100 text-blue-700',
  VIEWED: 'bg-green-100 text-green-700',
  DOWNLOADED: 'bg-purple-100 text-purple-700',
}

export default function PayslipsManagementPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  // Upload form
  const [uploadEmployee, setUploadEmployee] = useState('')
  const [uploadMonth, setUploadMonth] = useState(new Date().getMonth() + 1)
  const [uploadYear, setUploadYear] = useState(new Date().getFullYear())
  const [uploadGross, setUploadGross] = useState('')
  const [uploadNet, setUploadNet] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [selectedYear, selectedMonth])

  async function fetchData() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        month: selectedMonth.toString(),
      })

      const [payslipsRes, employeesRes] = await Promise.all([
        fetch(`/api/payslips?${params}`),
        fetch('/api/employees'),
      ])

      if (payslipsRes.ok) {
        const data = await payslipsRes.json()
        setPayslips(data)
      }
      if (employeesRes.ok) {
        const data = await employeesRes.json()
        setEmployees(data.employees || data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadEmployee || !uploadFile) {
      setError('Seleziona dipendente e file')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('employeeId', uploadEmployee)
      formData.append('month', uploadMonth.toString())
      formData.append('year', uploadYear.toString())
      formData.append('grossAmount', uploadGross)
      formData.append('netAmount', uploadNet)
      formData.append('file', uploadFile)

      const res = await fetch('/api/payslips', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Errore nel caricamento')

      setShowUploadModal(false)
      setUploadEmployee('')
      setUploadFile(null)
      setUploadGross('')
      setUploadNet('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    } finally {
      setUploading(false)
    }
  }

  async function handleSendNotification(id: string) {
    try {
      const res = await fetch(`/api/payslips/${id}/notify`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error("Errore nell'invio notifica")
      alert('Notifica inviata!')
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  // Stats
  const totalGross = payslips.reduce((sum, p) => sum + p.grossAmount, 0)
  const totalNet = payslips.reduce((sum, p) => sum + p.netAmount, 0)
  const viewedCount = payslips.filter((p) => p.status === 'VIEWED' || p.status === 'DOWNLOADED').length

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Buste Paga
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Carica e gestisci le buste paga dei dipendenti
            </p>
          </div>
          <PageInfoTooltip
            title="Gestione Cedolini"
            description="Carica i cedolini mensili e distribuiscili automaticamente ai dipendenti. Il sistema traccia le visualizzazioni e mantiene uno storico completo accessibile sia a te che ai collaboratori."
            tips={[
              'Usa nomenclatura standard (CF_MMAAAA.pdf) per upload automatico',
              'Invia notifica dopo il caricamento per avvisare il dipendente',
              'Conserva i cedolini per almeno 5 anni come richiesto dalla legge'
            ]}
          />
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Carica Busta Paga
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-4 mb-6">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
        >
          {monthNames.map((name, idx) => (
            <option key={idx} value={idx + 1}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
        >
          {[2024, 2025, 2026].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Buste Caricate
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {payslips.length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Visualizzate</p>
          <p className="text-3xl font-bold text-green-600">{viewedCount}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Totale Lordo</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalGross)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Totale Netto</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalNet)}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

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
                  Periodo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Lordo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Netto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Caricata il
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
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nessuna busta paga per questo periodo
                  </td>
                </tr>
              ) : (
                payslips.map((payslip) => (
                  <tr
                    key={payslip.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-750"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {payslip.employee.firstName} {payslip.employee.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {payslip.employee.department || payslip.employee.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {monthNames[payslip.month - 1]} {payslip.year}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(payslip.grossAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(payslip.netAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          statusColors[payslip.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusLabels[payslip.status] || payslip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(payslip.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {payslip.fileUrl && (
                          <a
                            href={payslip.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Scarica
                          </a>
                        )}
                        {payslip.status === 'UPLOADED' && (
                          <button
                            onClick={() => handleSendNotification(payslip.id)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Invia Notifica
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Carica Busta Paga
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dipendente
                </label>
                <select
                  value={uploadEmployee}
                  onChange={(e) => setUploadEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Seleziona dipendente</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mese
                  </label>
                  <select
                    value={uploadMonth}
                    onChange={(e) => setUploadMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  >
                    {monthNames.map((name, idx) => (
                      <option key={idx} value={idx + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Anno
                  </label>
                  <select
                    value={uploadYear}
                    onChange={(e) => setUploadYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  >
                    {[2024, 2025, 2026].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lordo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={uploadGross}
                    onChange={(e) => setUploadGross(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Netto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={uploadNet}
                    onChange={(e) => setUploadNet(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File PDF
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Caricamento...' : 'Carica'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
