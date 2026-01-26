'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  fiscalCode: string | null
  employeeCount: number
  pendingTasks: number
  complianceScore: number
  lastActivity: string | null
}

interface DashboardStats {
  totalClients: number
  totalEmployees: number
  pendingSignatures: number
  overdueDeadlines: number
  upcomingDeadlines: number
}

export default function ConsultantDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/consultant/dashboard')
      if (!res.ok) throw new Error('Errore nel caricamento')
      const data = await res.json()
      setClients(data.clients || [])
      setStats(data.stats || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Consulente
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Panoramica dei tuoi clienti e attività
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Clienti</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats?.totalClients || clients.length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Dipendenti Totali</p>
          <p className="text-3xl font-bold text-purple-600">
            {stats?.totalEmployees || clients.reduce((sum, c) => sum + c.employeeCount, 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Firme Pending</p>
          <p className="text-3xl font-bold text-amber-600">
            {stats?.pendingSignatures || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Scadenze Superate</p>
          <p className="text-3xl font-bold text-red-600">
            {stats?.overdueDeadlines || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Prossime Scadenze</p>
          <p className="text-3xl font-bold text-blue-600">
            {stats?.upcomingDeadlines || 0}
          </p>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">I Miei Clienti</h2>
          <Link
            href="/consultant/clients/new"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
          >
            + Nuovo Cliente
          </Link>
        </div>

        {clients.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-6xl mb-4 block">🏢</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nessun cliente ancora
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Aggiungi il tuo primo cliente per iniziare a gestire la loro compliance
            </p>
            <Link
              href="/consultant/clients/new"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Aggiungi Cliente
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-zinc-700">
            {clients.map((client) => (
              <div
                key={client.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-zinc-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {client.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {client.fiscalCode || 'P.IVA non inserita'} • {client.employeeCount} dipendenti
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Compliance Score */}
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${
                          client.complianceScore >= 80
                            ? 'text-green-600'
                            : client.complianceScore >= 60
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {client.complianceScore}%
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Compliance</p>
                    </div>

                    {/* Pending Tasks Badge */}
                    {client.pendingTasks > 0 && (
                      <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                        {client.pendingTasks} da fare
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/consultant/client/${client.id}/employees`}
                        className="px-3 py-2 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-600 text-sm"
                      >
                        Dipendenti
                      </Link>
                      <Link
                        href={`/consultant/client/${client.id}/compliance`}
                        className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 text-sm"
                      >
                        Compliance
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 grid grid-cols-4 gap-4 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Formazioni Scadute</p>
                    <p className="font-semibold text-gray-900 dark:text-white">0</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Documenti Pending</p>
                    <p className="font-semibold text-gray-900 dark:text-white">0</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">GDPR Consensi</p>
                    <p className="font-semibold text-gray-900 dark:text-white">100%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ultima Attività</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {client.lastActivity
                        ? new Date(client.lastActivity).toLocaleDateString('it-IT')
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/consultant/reports"
          className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 hover:border-purple-500 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Report</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Genera report compliance
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/consultant/communications"
          className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✉️</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Comunicazioni</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Invia comunicazioni ai clienti
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/consultant/templates"
          className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 hover:border-green-500 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Template</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gestisci template documenti
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
