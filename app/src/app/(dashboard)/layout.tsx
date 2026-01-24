import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const menuItems = [
    { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { href: '/employees', icon: '👥', label: 'Dipendenti' },
    { href: '/documents', icon: '📄', label: 'Documenti' },
    { href: '/deadlines', icon: '⏰', label: 'Scadenze' },
    { href: '/performance', icon: '📊', label: 'Performance' },
    { href: '/onboarding', icon: '📋', label: 'Onboarding' },
    { href: '/settings', icon: '⚙️', label: 'Impostazioni' }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-30">
        <div className="p-6">
          <Link href="/dashboard" className="text-2xl font-bold">
            <span className="text-blue-600">Genius</span>
            <span className="text-green-500">HR</span>
          </Link>
        </div>

        <nav className="px-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg mb-1 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {session.user.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              {/* Breadcrumb or search could go here */}
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <span className="text-xl">🔔</span>
              </button>
              <Link
                href="/api/auth/signout"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Esci
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="min-h-[calc(100vh-65px)]">
          {children}
        </div>
      </main>
    </div>
  )
}
