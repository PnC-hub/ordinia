'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

interface DashboardShellProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  user: {
    name?: string | null
    email?: string | null
    role: 'OWNER' | 'EMPLOYEE' | 'CONSULTANT'
  }
  brandColor?: 'blue' | 'green' | 'purple'
}

const brandColors = {
  blue: {
    primary: 'text-blue-600',
    secondary: 'text-blue-500',
    bg: 'bg-blue-100',
    border: 'border-blue-500',
  },
  green: {
    primary: 'text-green-600',
    secondary: 'text-green-500',
    bg: 'bg-green-100',
    border: 'border-green-500',
  },
  purple: {
    primary: 'text-purple-600',
    secondary: 'text-purple-500',
    bg: 'bg-purple-100',
    border: 'border-purple-500',
  },
}

export default function DashboardShell({
  children,
  sidebar,
  user,
  brandColor = 'blue',
}: DashboardShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const colors = brandColors[brandColor]

  const roleLabels: Record<string, string> = {
    OWNER: 'Gestore',
    EMPLOYEE: 'Dipendente',
    CONSULTANT: 'Consulente',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 z-50 transition-transform duration-300 lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
          <Link href="/dashboard" className="text-2xl font-bold">
            <span className={colors.primary}>Genius</span>
            <span className={colors.secondary}>HR</span>
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {roleLabels[user.role]}
          </p>
        </div>

        {/* Sidebar content */}
        <div className="overflow-y-auto h-[calc(100vh-180px)]">{sidebar}</div>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center`}
            >
              <span className={`${colors.primary} font-semibold`}>
                {user.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title="Esci"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 px-4 lg:px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="hidden lg:block">{/* Breadcrumb or search */}</div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {/* Badge */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Help */}
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="min-h-[calc(100vh-65px)]">{children}</div>
      </main>
    </div>
  )
}
