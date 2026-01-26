'use client'

import { useEffect, useState } from 'react'

interface TimeEntry {
  id: string
  date: string
  clockIn: string
  clockOut: string | null
  clockInLocationName: string | null
  clockOutLocationName: string | null
  totalMinutes: number | null
  netMinutes: number | null
  breakMinutes: number | null
  status: string
  notes: string | null
}

export default function EmployeeAttendancePage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [clockingIn, setClockingIn] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Get today's entry
  const today = new Date().toISOString().split('T')[0]
  const todayEntry = entries.find((e) => e.date.startsWith(today))

  useEffect(() => {
    fetchAttendance()
  }, [])

  async function fetchAttendance() {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const res = await fetch(`/api/attendance?dateFrom=${thirtyDaysAgo.toISOString().split('T')[0]}`)
      if (!res.ok) throw new Error('Errore nel caricamento')
      const data = await res.json()
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  async function getLocation(): Promise<{ lat: number; lng: number; name?: string }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalizzazione non supportata'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({ lat: latitude, lng: longitude })

          // Try to reverse geocode
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            resolve({
              lat: latitude,
              lng: longitude,
              name: data.display_name?.split(',').slice(0, 3).join(','),
            })
          } catch {
            resolve({ lat: latitude, lng: longitude })
          }
        },
        (err) => {
          setLocationError('Impossibile ottenere la posizione. Abilita la geolocalizzazione.')
          reject(err)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })
  }

  async function handleClockIn() {
    setClockingIn(true)
    setLocationError('')
    try {
      const location = await getLocation()

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock-in',
          latitude: location.lat,
          longitude: location.lng,
          locationName: location.name,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Errore nella timbratura')
      }

      fetchAttendance()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella timbratura')
    } finally {
      setClockingIn(false)
    }
  }

  async function handleClockOut() {
    setClockingIn(true)
    setLocationError('')
    try {
      const location = await getLocation()

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock-out',
          latitude: location.lat,
          longitude: location.lng,
          locationName: location.name,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Errore nella timbratura')
      }

      fetchAttendance()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella timbratura')
    } finally {
      setClockingIn(false)
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(new Date(dateStr))
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Calculate monthly stats
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyEntries = entries.filter((e) => {
    const date = new Date(e.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })
  const totalMonthlyMinutes = monthlyEntries.reduce((sum, e) => sum + (e.netMinutes || 0), 0)
  const daysWorked = monthlyEntries.filter((e) => e.clockOut).length

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timbratura</h1>
        <p className="text-gray-600 dark:text-gray-400">Registra entrate e uscite</p>
      </div>

      {/* Clock In/Out Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 mb-8 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Oggi</h2>
            <div className="text-5xl font-bold mb-2">
              {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-green-100 mb-4">
              {new Date().toLocaleDateString('it-IT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>

            {todayEntry && (
              <div className="bg-white/20 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-green-100">Entrata</p>
                    <p className="font-semibold text-lg">{formatTime(todayEntry.clockIn)}</p>
                    {todayEntry.clockInLocationName && (
                      <p className="text-xs text-green-200 truncate">{todayEntry.clockInLocationName}</p>
                    )}
                  </div>
                  {todayEntry.clockOut && (
                    <div>
                      <p className="text-green-100">Uscita</p>
                      <p className="font-semibold text-lg">{formatTime(todayEntry.clockOut)}</p>
                      {todayEntry.clockOutLocationName && (
                        <p className="text-xs text-green-200 truncate">{todayEntry.clockOutLocationName}</p>
                      )}
                    </div>
                  )}
                </div>
                {todayEntry.netMinutes && (
                  <div className="mt-2 pt-2 border-t border-white/20">
                    <p className="text-green-100 text-sm">Totale: {formatDuration(todayEntry.netMinutes)}</p>
                  </div>
                )}
              </div>
            )}

            {locationError && (
              <div className="bg-red-500/30 rounded-lg p-3 mb-4 text-sm">
                {locationError}
              </div>
            )}

            <div className="flex gap-3">
              {!todayEntry?.clockIn ? (
                <button
                  onClick={handleClockIn}
                  disabled={clockingIn}
                  className="flex-1 bg-white text-green-600 px-6 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {clockingIn ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Rilevamento posizione...
                    </>
                  ) : (
                    <>📥 Timbra Entrata</>
                  )}
                </button>
              ) : !todayEntry?.clockOut ? (
                <button
                  onClick={handleClockOut}
                  disabled={clockingIn}
                  className="flex-1 bg-white text-red-600 px-6 py-4 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {clockingIn ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Rilevamento posizione...
                    </>
                  ) : (
                    <>📤 Timbra Uscita</>
                  )}
                </button>
              ) : (
                <div className="flex-1 bg-green-400/30 px-6 py-4 rounded-lg text-center font-medium">
                  ✅ Giornata completata
                </div>
              )}
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-4">Riepilogo Mese</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-green-100 text-sm">Giorni lavorati</p>
                <p className="text-2xl font-bold">{daysWorked}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-green-100 text-sm">Ore totali</p>
                <p className="text-2xl font-bold">{Math.round(totalMonthlyMinutes / 60)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {/* History */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Storico Ultimi 30 Giorni</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-900">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Entrata</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Uscita</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Totale</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Caricamento...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nessuna timbratura trovata
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-zinc-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(entry.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{formatTime(entry.clockIn)}</div>
                      {entry.clockInLocationName && (
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">
                          {entry.clockInLocationName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.clockOut ? (
                        <>
                          <div className="text-sm text-gray-900 dark:text-white">{formatTime(entry.clockOut)}</div>
                          {entry.clockOutLocationName && (
                            <div className="text-xs text-gray-500 truncate max-w-[150px]">
                              {entry.clockOutLocationName}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDuration(entry.netMinutes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          entry.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : entry.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {entry.status === 'APPROVED' ? 'Approvato' : entry.status === 'REJECTED' ? 'Rifiutato' : 'In attesa'}
                      </span>
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
