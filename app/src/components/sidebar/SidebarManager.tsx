'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MenuItem {
  href: string
  icon: string
  label: string
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

const menuSections: MenuSection[] = [
  {
    title: 'Ordinia',
    items: [
      { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { href: '/employees', icon: '👥', label: 'Dipendenti' },
      { href: '/documents', icon: '📄', label: 'Documenti' },
      { href: '/signatures', icon: '✍️', label: 'Firme' },
      { href: '/attendance', icon: '⏱️', label: 'Presenze' },
      { href: '/leaves', icon: '🏖️', label: 'Ferie e Permessi' },
      { href: '/expenses', icon: '💰', label: 'Spese e Rimborsi' },
      { href: '/payslips', icon: '📑', label: 'Buste Paga' },
    ],
  },
  {
    title: 'HR & Formazione',
    items: [
      { href: '/onboarding', icon: '📋', label: 'Onboarding' },
      { href: '/probation', icon: '🎯', label: 'Periodo Prova' },
      { href: '/performance', icon: '📊', label: 'Performance' },
      { href: '/training', icon: '🎓', label: 'Formazione' },
    ],
  },
  {
    title: 'HR Admin',
    items: [
      { href: '/deadlines', icon: '⏰', label: 'Scadenze' },
      { href: '/hr-costs', icon: '💶', label: 'Costi HR' },
      { href: '/safety', icon: '🦺', label: 'Sicurezza 81/08' },
      { href: '/disciplinary', icon: '⚖️', label: 'Disciplinare' },
      { href: '/whistleblowing', icon: '📢', label: 'Whistleblowing' },
      { href: '/compliance', icon: '✅', label: 'Compliance' },
    ],
  },
  {
    title: 'Manuale Operativo',
    items: [
      { href: '/manual', icon: '📖', label: 'Dashboard Manuale' },
      { href: '/manual/search', icon: '🔍', label: 'Cerca' },
      { href: '/manual/checklists', icon: '☑️', label: 'Checklist' },
      { href: '/manual/acknowledgments', icon: '📋', label: 'Prese Visione' },
      { href: '/manual/editor', icon: '✏️', label: 'Nuovo Articolo' },
    ],
  },
  {
    title: 'AI & Guide',
    items: [
      { href: '/ai-assistant', icon: '🧠', label: 'Brain AI' },
      { href: '/tutorials', icon: '📚', label: 'Centro Formazione' },
    ],
  },
  {
    title: 'Impostazioni',
    items: [
      { href: '/settings', icon: '⚙️', label: 'Impostazioni' },
      { href: '/settings/team', icon: '👤', label: 'Team e Ruoli' },
      { href: '/settings/integrations', icon: '🔗', label: 'Integrazioni' },
    ],
  },
]

export default function SidebarManager() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
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
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}
