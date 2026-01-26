'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

interface SidebarEmployeeProps {
  pendingSignatures?: number
  pendingLeaves?: number
  unreadNotifications?: number
}

export default function SidebarEmployee({
  pendingSignatures = 0,
  pendingLeaves = 0,
  unreadNotifications = 0,
}: SidebarEmployeeProps) {
  const pathname = usePathname()

  const menuSections: MenuSection[] = [
    {
      title: 'Il Mio Spazio',
      items: [
        { href: '/employee/dashboard', icon: '🏠', label: 'Home' },
        { href: '/employee/profile', icon: '👤', label: 'Il Mio Profilo' },
        { href: '/employee/documents', icon: '📁', label: 'I Miei Documenti' },
        { href: '/employee/payslips', icon: '📑', label: 'Buste Paga' },
        {
          href: '/employee/signatures',
          icon: '✍️',
          label: 'Da Firmare',
          badge: pendingSignatures,
        },
      ],
    },
    {
      title: 'Richieste',
      items: [
        { href: '/employee/attendance', icon: '⏱️', label: 'Timbratura' },
        {
          href: '/employee/leaves',
          icon: '🏖️',
          label: 'Ferie e Permessi',
          badge: pendingLeaves,
        },
        { href: '/employee/expenses', icon: '💰', label: 'Note Spese' },
      ],
    },
    {
      title: 'Formazione',
      items: [
        { href: '/employee/training', icon: '🎓', label: 'I Miei Corsi' },
        { href: '/employee/safety', icon: '🦺', label: 'Sicurezza' },
      ],
    },
    {
      title: 'Supporto',
      items: [
        { href: '/employee/help', icon: '❓', label: 'Assistenza' },
        {
          href: '/employee/notifications',
          icon: '🔔',
          label: 'Notifiche',
          badge: unreadNotifications,
        },
      ],
    },
  ]

  const isActive = (href: string) => {
    if (href === '/employee/dashboard') {
      return pathname === '/employee/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="px-2 py-4 space-y-6">
      {menuSections.map((section) => (
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
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
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
      ))}

      {/* Quick Actions */}
      <div className="px-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Azioni Rapide
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/employee/attendance/clock-in"
            className="flex flex-col items-center gap-1 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
          >
            <span className="text-2xl">📥</span>
            <span className="text-xs font-medium">Entra</span>
          </Link>
          <Link
            href="/employee/attendance/clock-out"
            className="flex flex-col items-center gap-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <span className="text-2xl">📤</span>
            <span className="text-xs font-medium">Esci</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
