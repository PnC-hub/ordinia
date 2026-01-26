'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface MenuItem {
  href: string
  icon: string
  label: string
  badge?: number
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

interface Client {
  id: string
  name: string
  employeeCount: number
  pendingTasks: number
}

interface SidebarConsultantProps {
  clients?: Client[]
  selectedClientId?: string | null
  onClientChange?: (clientId: string | null) => void
}

export default function SidebarConsultant({
  clients = [],
  selectedClientId = null,
  onClientChange,
}: SidebarConsultantProps) {
  const pathname = usePathname()
  const [isClientSelectorOpen, setIsClientSelectorOpen] = useState(false)

  const selectedClient = clients.find((c) => c.id === selectedClientId)

  const menuSections: MenuSection[] = [
    {
      title: 'Dashboard',
      items: [
        { href: '/consultant/dashboard', icon: '🏠', label: 'Panoramica' },
        { href: '/consultant/clients', icon: '🏢', label: 'I Miei Clienti' },
        { href: '/consultant/tasks', icon: '📋', label: 'Attività' },
        { href: '/consultant/calendar', icon: '📅', label: 'Calendario' },
      ],
    },
    {
      title: 'Cliente Selezionato',
      items: selectedClientId
        ? [
            {
              href: `/consultant/client/${selectedClientId}/employees`,
              icon: '👥',
              label: 'Dipendenti',
            },
            {
              href: `/consultant/client/${selectedClientId}/documents`,
              icon: '📄',
              label: 'Documenti',
            },
            {
              href: `/consultant/client/${selectedClientId}/payslips`,
              icon: '📑',
              label: 'Buste Paga',
            },
            {
              href: `/consultant/client/${selectedClientId}/compliance`,
              icon: '✅',
              label: 'Compliance',
            },
            {
              href: `/consultant/client/${selectedClientId}/deadlines`,
              icon: '⏰',
              label: 'Scadenze',
            },
            {
              href: `/consultant/client/${selectedClientId}/safety`,
              icon: '🦺',
              label: 'Sicurezza 81/08',
            },
          ]
        : [],
    },
    {
      title: 'Strumenti',
      items: [
        { href: '/consultant/templates', icon: '📝', label: 'Template' },
        { href: '/consultant/reports', icon: '📊', label: 'Report' },
        { href: '/consultant/communications', icon: '✉️', label: 'Comunicazioni' },
      ],
    },
    {
      title: 'AI Powered',
      items: [{ href: '/consultant/ai-assistant', icon: '🤖', label: 'Assistente AI' }],
    },
    {
      title: 'Account',
      items: [
        { href: '/consultant/settings', icon: '⚙️', label: 'Impostazioni' },
        { href: '/consultant/billing', icon: '💳', label: 'Fatturazione' },
      ],
    },
  ]

  const isActive = (href: string) => {
    if (href === '/consultant/dashboard') {
      return pathname === '/consultant/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="px-2 py-4 space-y-4">
      {/* Client Selector */}
      <div className="px-2 mb-4">
        <div className="relative">
          <button
            onClick={() => setIsClientSelectorOpen(!isClientSelectorOpen)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl">🏢</span>
              <div className="text-left min-w-0">
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100 truncate">
                  {selectedClient?.name || 'Seleziona Cliente'}
                </p>
                {selectedClient && (
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    {selectedClient.employeeCount} dipendenti
                  </p>
                )}
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-purple-600 transition-transform ${
                isClientSelectorOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {isClientSelectorOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-lg z-50 max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  onClientChange?.(null)
                  setIsClientSelectorOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                Tutti i Clienti
              </button>
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    onClientChange?.(client.id)
                    setIsClientSelectorOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 ${
                    selectedClientId === client.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {client.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {client.employeeCount} dipendenti
                      </p>
                    </div>
                    {client.pendingTasks > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {client.pendingTasks}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Menu Sections */}
      {menuSections.map((section) => {
        // Skip "Cliente Selezionato" section if no client is selected
        if (section.title === 'Cliente Selezionato' && !selectedClientId) {
          return null
        }

        return (
          <div key={section.title}>
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-sm flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </nav>
  )
}
