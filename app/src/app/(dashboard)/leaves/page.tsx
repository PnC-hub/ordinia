'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageInfoTooltip from '@/components/PageInfoTooltip'
import TutorialLink from '@/components/TutorialLink'

interface LeaveRequest {
  id: string
  type: string
  status: string
  startDate: string
  endDate: string
  totalDays: number
  totalHours: number | null
  reason: string | null
  requestedAt: string
  reviewedAt: string | null
  reviewNotes: string | null
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

interface LeaveBalance {
  employeeId: string
  employee: {
    firstName: string
    lastName: string
  }
  vacationDays: number
  vacationUsed: number
  vacationRemaining: number
  sickDays: number
  sickUsed: number
  permits: number
  permitsUsed: number
}

interface CalendarDay {
  id: string
  employeeId: string
  employeeName: string
  type: string
  status: string
  startHalf?: boolean
  endHalf?: boolean
}

interface Employee {
  id: string
  firstName: string
  lastName: string
}

const typeLabels: Record<string, string> = {
  VACATION: 'Ferie',
  SICK: 'Malattia',
  PERSONAL: 'Permesso',
  ROL: 'ROL',
  EX_FESTIVITY: 'Ex Festività',
  PARENTAL: 'Congedo Parentale',
  MATERNITY: 'Maternità',
  PATERNITY: 'Paternità',
  BEREAVEMENT: 'Lutto',
  MARRIAGE: 'Matrimonio',
  STUDY: 'Studio/Esami',
  BLOOD_DONATION: 'Donazione Sangue',
  UNION: 'Permesso Sindacale',
  MEDICAL_VISIT: 'Visita Medica',
  LAW_104: 'Legge 104',
  UNPAID: 'Non Retribuito',
  OTHER: 'Altro',
}

const typeColors: Record<string, string> = {
  VACATION: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  SICK: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  PERSONAL: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  ROL: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  PARENTAL: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  BEREAVEMENT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  MARRIAGE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  OTHER: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

const statusLabels: Record<string, string> = {
  PENDING: 'In attesa',
  APPROVED: 'Approvata',
  REJECTED: 'Rifiutata',
  CANCELLED: 'Annullata',
  IN_PROGRESS: 'In corso',
  COMPLETED: 'Completata',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  CANCELLED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  COMPLETED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

export default function LeavesManagementPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [calendarData, setCalendarData] = useState<Record<string, CalendarDay[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState<'calendar' | 'requests' | 'balances'>('requests')

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterEmployee, setFilterEmployee] = useState<string>('all')
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear())

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1)
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear())

  // Modals
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [reviewReason, setReviewReason] = useState('')

  // New request form
  const [newRequest, setNewRequest] = useState({
    employeeId: '',
    type: 'VACATION',
    startDate: '',
    endDate: '',
    startHalf: false,
    endHalf: false,
    reason: '',
  })

  useEffect(() => {
    fetchData()
    fetchEmployees()
  }, [filterStatus, filterType, filterEmployee, filterYear])

  useEffect(() => {
    if (view === 'calendar') {
      fetchCalendarData()
    }
  }, [view, calendarMonth, calendarYear])

  async function fetchData() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterType !== 'all') params.set('type', filterType)
      if (filterEmployee !== 'all') params.set('employeeId', filterEmployee)
      if (filterYear) params.set('year', filterYear.toString())

      const [requestsRes, balancesRes] = await Promise.all([
        fetch(`/api/leaves?${params}`),
        fetch(`/api/leaves/balances?year=${filterYear}`),
      ])

      if (requestsRes.ok) {
        const data = await requestsRes.json()
        setRequests(data)
      }
      if (balancesRes.ok) {
        const data = await balancesRes.json()
        setBalances(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }

  async function fetchEmployees() {
    try {
      const res = await fetch('/api/employees')
      if (res.ok) {
        const data = await res.json()
        setEmployees(data)
      }
    } catch (err) {
      console.error('Error fetching employees:', err)
    }
  }

  async function fetchCalendarData() {
    try {
      const res = await fetch(
        `/api/leaves/calendar?month=${calendarMonth}&year=${calendarYear}`
      )
      if (res.ok) {
        const data = await res.json()
        setCalendarData(data.calendarData || {})
      }
    } catch (err) {
      console.error('Error fetching calendar:', err)
    }
  }

  async function handleReview(leave: LeaveRequest, action: 'approve' | 'reject') {
    setSelectedLeave(leave)
    setReviewAction(action)
    setReviewReason('')
    setShowReviewModal(true)
  }

  async function submitReview() {
    if (!selectedLeave) return

    if (reviewAction === 'reject' && !reviewReason.trim()) {
      setError('Il motivo del rifiuto è obbligatorio')
      return
    }

    try {
      const res = await fetch(`/api/leaves/${selectedLeave.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: reviewAction,
          reason: reviewReason,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Errore nella revisione')
      }

      setShowReviewModal(false)
      setSelectedLeave(null)
      setReviewReason('')
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  async function handleCreateRequest() {
    if (!newRequest.startDate || !newRequest.endDate) {
      setError('Data inizio e fine sono obbligatorie')
      return
    }

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Errore nella creazione')
      }

      setShowNewRequestModal(false)
      setNewRequest({
        employeeId: '',
        type: 'VACATION',
        startDate: '',
        endDate: '',
        startHalf: false,
        endHalf: false,
        reason: '',
      })
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  async function handleExport() {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterType !== 'all') params.set('type', filterType)
      if (filterEmployee !== 'all') params.set('employeeId', filterEmployee)
      if (filterYear) params.set('year', filterYear.toString())

      const res = await fetch(`/api/leaves/export?${params}`)
      if (!res.ok) throw new Error('Errore export')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ferie-permessi-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore export')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay()
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear)
    const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear)
    const days = []
    const startDay = firstDay === 0 ? 6 : firstDay - 1 // Adjust for Monday start

    // Empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-24 p-2 bg-gray-50 dark:bg-zinc-900" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarYear, calendarMonth - 1, day)
      const dateKey = date.toISOString().split('T')[0]
      const dayLeaves = calendarData[dateKey] || []
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const isToday = dateKey === new Date().toISOString().split('T')[0]

      days.push(
        <div
          key={day}
          className={`min-h-24 p-2 border border-gray-200 dark:border-zinc-700 ${
            isWeekend ? 'bg-gray-50 dark:bg-zinc-900' : 'bg-white dark:bg-zinc-800'
          } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className="font-medium text-sm text-gray-900 dark:text-white mb-1">{day}</div>
          <div className="space-y-1">
            {dayLeaves.slice(0, 3).map((leave) => (
              <div
                key={`${leave.id}-${dateKey}`}
                className={`text-xs px-1 py-0.5 rounded truncate ${
                  typeColors[leave.type] || typeColors.OTHER
                }`}
                title={`${leave.employeeName} - ${typeLabels[leave.type]}`}
              >
                {leave.employeeName.split(' ')[0]}
                {leave.startHalf && ' (PM)'}
                {leave.endHalf && ' (AM)'}
              </div>
            ))}
            {dayLeaves.length > 3 && (
              <div className="text-xs text-gray-500">+{dayLeaves.length - 3} altri</div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  // Stats
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length
  const totalDaysRequested = requests
    .filter((r) => r.status === 'PENDING')
    .reduce((sum, r) => sum + r.totalDays, 0)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ferie e Permessi
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestisci richieste ferie, permessi e saldi dipendenti
            </p>
          </div>
          <PageInfoTooltip
            title="Gestione Ferie e Permessi"
            description="Visualizza e gestisci tutte le richieste di assenza dei tuoi collaboratori. Approva o rifiuta le richieste e monitora i saldi residui."
            tips={[
              'Usa il filtro "Da Approvare" per le richieste urgenti',
              'Controlla i saldi prima di approvare lunghe assenze',
              'Il sistema calcola automaticamente i giorni lavorativi',
              'Esporta i dati in CSV per inviarli al consulente del lavoro',
            ]}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Nuova Richiesta
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Tutorial Banner */}
      <TutorialLink tutorialId="leave-planning" variant="banner" className="mb-6" />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Totale Richieste</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{requests.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Da Approvare</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Approvate</p>
          <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Giorni in Attesa</p>
          <p className="text-3xl font-bold text-blue-600">{totalDaysRequested}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-900 dark:text-red-300">
            ×
          </button>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('calendar')}
          className={`px-4 py-2 rounded-lg font-medium ${
            view === 'calendar'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
          }`}
        >
          Calendario
        </button>
        <button
          onClick={() => setView('requests')}
          className={`px-4 py-2 rounded-lg font-medium ${
            view === 'requests'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
          }`}
        >
          Richieste
        </button>
        <button
          onClick={() => setView('balances')}
          className={`px-4 py-2 rounded-lg font-medium ${
            view === 'balances'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
          }`}
        >
          Saldi
        </button>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
            <button
              onClick={() => {
                if (calendarMonth === 1) {
                  setCalendarMonth(12)
                  setCalendarYear(calendarYear - 1)
                } else {
                  setCalendarMonth(calendarMonth - 1)
                }
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
            >
              ←
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date(calendarYear, calendarMonth - 1).toLocaleDateString('it-IT', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <button
              onClick={() => {
                if (calendarMonth === 12) {
                  setCalendarMonth(1)
                  setCalendarYear(calendarYear + 1)
                } else {
                  setCalendarMonth(calendarMonth + 1)
                }
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0">
            {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
              <div
                key={day}
                className="p-2 text-center font-medium text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700"
              >
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      )}

      {/* Requests View */}
      {view === 'requests' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
            >
              <option value="all">Tutti gli stati</option>
              <option value="PENDING">In attesa</option>
              <option value="APPROVED">Approvate</option>
              <option value="REJECTED">Rifiutate</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
            >
              <option value="all">Tutti i tipi</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
            >
              <option value="all">Tutti i dipendenti</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
            >
              {[2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
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
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Periodo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Giorni
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
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Caricamento...
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Nessuna richiesta trovata
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-zinc-750">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {req.employee.firstName} {req.employee.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {req.employee.department || req.employee.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              typeColors[req.type] || typeColors.OTHER
                            }`}
                          >
                            {typeLabels[req.type] || req.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <p className="text-gray-900 dark:text-white">
                            {formatDate(req.startDate)} - {formatDate(req.endDate)}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {req.totalDays}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              statusColors[req.status] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {statusLabels[req.status] || req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {req.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleReview(req, 'approve')}
                                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                                >
                                  Approva
                                </button>
                                <button
                                  onClick={() => handleReview(req, 'reject')}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  Rifiuta
                                </button>
                              </>
                            )}
                            <Link
                              href={`/leaves/${req.id}`}
                              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
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
        </>
      )}

      {/* Balances View */}
      {view === 'balances' && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-900">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Dipendente
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Ferie Totali
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Ferie Usate
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Ferie Residue
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Permessi (h)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Permessi Usati (h)
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
                ) : balances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Nessun saldo disponibile
                    </td>
                  </tr>
                ) : (
                  balances.map((bal) => (
                    <tr key={bal.employeeId} className="hover:bg-gray-50 dark:hover:bg-zinc-750">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {bal.employee.firstName} {bal.employee.lastName}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-900 dark:text-white">{bal.vacationDays}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-red-600">{bal.vacationUsed}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-green-600">
                          {bal.vacationRemaining}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-900 dark:text-white">{bal.permits}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-red-600">{bal.permitsUsed}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Nuova Richiesta Ferie/Permessi
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dipendente
                </label>
                <select
                  value={newRequest.employeeId}
                  onChange={(e) => setNewRequest({ ...newRequest, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                >
                  <option value="">Seleziona dipendente</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo Assenza
                </label>
                <select
                  value={newRequest.type}
                  onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                >
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Inizio
                  </label>
                  <input
                    type="date"
                    value={newRequest.startDate}
                    onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Fine
                  </label>
                  <input
                    type="date"
                    value={newRequest.endDate}
                    onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newRequest.startHalf}
                    onChange={(e) => setNewRequest({ ...newRequest, startHalf: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Mezza giornata inizio
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newRequest.endHalf}
                    onChange={(e) => setNewRequest({ ...newRequest, endHalf: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Mezza giornata fine
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motivazione (opzionale)
                </label>
                <textarea
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateRequest}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crea Richiesta
              </button>
              <button
                onClick={() => setShowNewRequestModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-zinc-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-zinc-500"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {reviewAction === 'approve' ? 'Approva Richiesta' : 'Rifiuta Richiesta'}
            </h2>
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Dipendente:</strong> {selectedLeave.employee.firstName}{' '}
                {selectedLeave.employee.lastName}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Tipo:</strong> {typeLabels[selectedLeave.type]}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Periodo:</strong> {formatDate(selectedLeave.startDate)} -{' '}
                {formatDate(selectedLeave.endDate)}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Giorni:</strong> {selectedLeave.totalDays}
              </p>
            </div>

            {reviewAction === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motivo del rifiuto *
                </label>
                <textarea
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  rows={3}
                  placeholder="Spiega il motivo del rifiuto..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {reviewAction === 'approve' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Commento (opzionale)
                </label>
                <textarea
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  rows={2}
                  placeholder="Aggiungi un commento..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={submitReview}
                className={`flex-1 px-4 py-2 rounded-lg text-white ${
                  reviewAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {reviewAction === 'approve' ? 'Approva' : 'Rifiuta'}
              </button>
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setSelectedLeave(null)
                  setReviewReason('')
                }}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-zinc-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-zinc-500"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
