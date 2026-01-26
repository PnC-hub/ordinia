'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Impostazioni
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestisci le impostazioni del tuo account e dell&apos;organizzazione
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profilo */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-xl">👤</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Profilo</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gestisci i tuoi dati personali</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Email: {session.user?.email}
          </p>
          <Link
            href="/settings/profile"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Modifica profilo →
          </Link>
        </div>

        {/* Branding */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 text-xl">🎨</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Branding</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Logo e colori aziendali</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Personalizza l&apos;aspetto della piattaforma
          </p>
          <Link
            href="/settings/branding"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Gestisci branding →
          </Link>
        </div>

        {/* Notifiche */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              <span className="text-amber-600 dark:text-amber-400 text-xl">🔔</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Notifiche</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Preferenze di notifica</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Email, promemoria e avvisi
          </p>
          <Link
            href="/settings/notifications"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Configura notifiche →
          </Link>
        </div>

        {/* Sicurezza */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-xl">🔒</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Sicurezza</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Password e accesso</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Cambia password e gestisci la sicurezza
          </p>
          <Link
            href="/settings/security"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Impostazioni sicurezza →
          </Link>
        </div>

        {/* Organizzazione */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-xl">🏢</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Organizzazione</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dati aziendali</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Ragione sociale, indirizzo, P.IVA
          </p>
          <Link
            href="/settings/organization"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Modifica organizzazione →
          </Link>
        </div>

        {/* Abbonamento */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <span className="text-indigo-600 dark:text-indigo-400 text-xl">💳</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Abbonamento</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Piano e fatturazione</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Gestisci il tuo piano e i pagamenti
          </p>
          <Link
            href="/settings/billing"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Gestisci abbonamento →
          </Link>
        </div>
      </div>
    </div>
  )
}
