import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Get user's tenants
  const memberships = await prisma.tenantMember.findMany({
    where: { userId: session.user.id },
    include: {
      tenant: {
        include: {
          _count: {
            select: { employees: true, deadlines: true }
          }
        }
      }
    }
  })

  // Get upcoming deadlines
  const upcomingDeadlines = memberships.length > 0 ? await prisma.deadline.findMany({
    where: {
      tenantId: memberships[0].tenant.id,
      status: { in: ['PENDING', 'UPCOMING'] },
      dueDate: {
        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      }
    },
    include: { employee: true },
    orderBy: { dueDate: 'asc' },
    take: 5
  }) : []

  const tenant = memberships[0]?.tenant

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Benvenuto, {session.user.name} - {tenant?.name || 'Nessuno studio'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dipendenti</p>
              <p className="text-2xl font-bold">{tenant?._count.employees || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Scadenze Attive</p>
              <p className="text-2xl font-bold">{tenant?._count.deadlines || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Compliance</p>
              <p className="text-2xl font-bold">100%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Piano</p>
              <p className="text-2xl font-bold">{tenant?.plan || 'Trial'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Scadenze Imminenti</h2>
            <a href="/deadlines" className="text-sm text-blue-600 hover:underline">
              Vedi tutte
            </a>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nessuna scadenza nei prossimi 30 giorni
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => {
                const daysUntil = Math.ceil(
                  (new Date(deadline.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )
                const isUrgent = daysUntil <= 7

                return (
                  <div
                    key={deadline.id}
                    className={`p-4 rounded-lg border ${
                      isUrgent ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{deadline.title}</p>
                        <p className="text-sm text-gray-500">
                          {deadline.employee?.firstName} {deadline.employee?.lastName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                          {daysUntil} giorni
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(deadline.dueDate).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Azioni Rapide</h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/employees/new"
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors"
            >
              <span className="text-2xl mb-2 block">👤</span>
              <span className="text-sm font-medium">Nuovo Dipendente</span>
            </a>
            <a
              href="/documents/upload"
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
            >
              <span className="text-2xl mb-2 block">📄</span>
              <span className="text-sm font-medium">Carica Documento</span>
            </a>
            <a
              href="/deadlines/new"
              className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-center transition-colors"
            >
              <span className="text-2xl mb-2 block">⏰</span>
              <span className="text-sm font-medium">Nuova Scadenza</span>
            </a>
            <a
              href="/performance/new"
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors"
            >
              <span className="text-2xl mb-2 block">📊</span>
              <span className="text-sm font-medium">Valutazione</span>
            </a>
          </div>
        </div>

        {/* Subscription Status */}
        {tenant?.subscriptionStatus === 'TRIAL' && (
          <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-1">Periodo di Prova Attivo</h3>
                <p className="text-blue-100">
                  {tenant.trialEndsAt && (
                    <>
                      Scade il {new Date(tenant.trialEndsAt).toLocaleDateString('it-IT')}.
                      Attiva il tuo abbonamento per continuare.
                    </>
                  )}
                </p>
              </div>
              <a
                href="/settings/billing"
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Attiva Abbonamento
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
