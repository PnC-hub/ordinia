'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardData {
  profile: {
    firstName: string
    lastName: string
    department: string | null
    jobTitle: string | null
    hireDate: string
  }
  stats: {
    pendingSignatures: number
    pendingLeaves: number
    unreadNotifications: number
    documentsCount: number
  }
  todayAttendance: {
    clockIn: string | null
    clockOut: string | null
    status: string
  } | null
  leaveBalance: {
    type: string
    available: number
    used: number
    pending: number
  }[]
  recentPayslips: {
    id: string
    year: number
    month: string
    netSalary: number
  }[]
  upcomingDeadlines: {
    id: string
    title: string
    dueDate: string
    type: string
  }[]
}

export default function EmployeeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [clockingIn, setClockingIn] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      // Fetch multiple endpoints in parallel
      const [profileRes, signaturesRes, leavesRes] = await Promise.all([
        fetch('/api/employees/me'),
        fetch('/api/signatures?status=PENDING'),
        fetch('/api/leaves/balance'),
      ])

      // For now, create mock data structure
      // In production, these would come from the API
      const profile = profileRes.ok ? await profileRes.json() : null
      const pendingSignatures = signaturesRes.ok ? (await signaturesRes.json()).length : 0
      const leaveBalance = leavesRes.ok ? await leavesRes.json() : []

      setData({
        profile: profile || {
          firstName: 'Dipendente',
          lastName: '',
          department: null,
          jobTitle: null,
          hireDate: new Date().toISOString(),
        },
        stats: {
          pendingSignatures,
          pendingLeaves: 0,
          unreadNotifications: 0,
          documentsCount: 0,
        },
        todayAttendance: null,
        leaveBalance,
        recentPayslips: [],
        upcomingDeadlines: [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }

  async function handleClockIn() {
    setClockingIn(true)
    try {
      // Get geolocation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock-in',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Errore nella timbratura')
      }

      // Refresh data
      fetchDashboardData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella timbratura')
    } finally {
      setClockingIn(false)
    }
  }

  async function handleClockOut() {
    setClockingIn(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock-out',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Errore nella timbratura')
      }

      fetchDashboardData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella timbratura')
    } finally {
      setClockingIn(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    )
  }

  if (!data) return null

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ciao, {data.profile.firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {data.profile.jobTitle || data.profile.department || 'Benvenuto nel tuo portale dipendente'}
        </p>
      </div>

      {/* Clock In/Out Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-2">Timbratura</h2>
            {data.todayAttendance ? (
              <div>
                <p className="text-green-100">
                  Entrata: {new Date(data.todayAttendance.clockIn!).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {data.todayAttendance.clockOut && (
                  <p className="text-green-100">
                    Uscita: {new Date(data.todayAttendance.clockOut).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-green-100">Nessuna timbratura oggi</p>
            )}
          </div>
          <div className="flex gap-3">
            {!data.todayAttendance?.clockIn ? (
              <button
                onClick={handleClockIn}
                disabled={clockingIn}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                {clockingIn ? 'Attendere...' : 'Entra'}
              </button>
            ) : !data.todayAttendance?.clockOut ? (
              <button
                onClick={handleClockOut}
                disabled={clockingIn}
                className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {clockingIn ? 'Attendere...' : 'Esci'}
              </button>
            ) : (
              <span className="bg-green-400/30 px-4 py-2 rounded-lg">Giornata completata</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/employee/signatures"
          className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700 hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✍️</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.stats.pendingSignatures}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Da firmare</p>
            </div>
          </div>
        </Link>

        <Link
          href="/employee/documents"
          className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700 hover:border-purple-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📁</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.stats.documentsCount}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Documenti</p>
            </div>
          </div>
        </Link>

        <Link
          href="/employee/leaves"
          className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700 hover:border-green-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏖️</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.leaveBalance.find(l => l.type === 'VACATION')?.available || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Giorni ferie</p>
            </div>
          </div>
        </Link>

        <Link
          href="/employee/expenses"
          className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700 hover:border-amber-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.stats.pendingLeaves}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Spese in attesa</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Balance */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Saldo Ferie e Permessi</h3>
            <Link href="/employee/leaves" className="text-sm text-blue-600 hover:underline">
              Richiedi
            </Link>
          </div>
          {data.leaveBalance.length > 0 ? (
            <div className="space-y-4">
              {data.leaveBalance.map((balance) => (
                <div key={balance.type} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {balance.type === 'VACATION' ? 'Ferie' : balance.type === 'SICK' ? 'Malattia' : balance.type}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Usati: {balance.used} | In attesa: {balance.pending}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{balance.available}</p>
                    <p className="text-xs text-gray-500">disponibili</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Nessun saldo disponibile</p>
          )}
        </div>

        {/* Recent Payslips */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ultime Buste Paga</h3>
            <Link href="/employee/payslips" className="text-sm text-blue-600 hover:underline">
              Vedi tutte
            </Link>
          </div>
          {data.recentPayslips.length > 0 ? (
            <div className="space-y-3">
              {data.recentPayslips.map((payslip) => (
                <div key={payslip.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📑</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {payslip.month} {payslip.year}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    €{payslip.netSalary.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Nessuna busta paga disponibile</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Azioni Rapide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/employee/leaves/new"
              className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
            >
              <span className="text-3xl">🏖️</span>
              <span className="text-sm font-medium text-green-700 dark:text-green-400">Richiedi Ferie</span>
            </Link>
            <Link
              href="/employee/expenses/new"
              className="flex flex-col items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            >
              <span className="text-3xl">🧾</span>
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Nota Spese</span>
            </Link>
            <Link
              href="/employee/documents"
              className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
            >
              <span className="text-3xl">📁</span>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-400">I Miei Documenti</span>
            </Link>
            <Link
              href="/employee/help"
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <span className="text-3xl">❓</span>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Assistenza</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
