import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const membership = await prisma.tenantMember.findFirst({
    where: { userId: session.user.id },
    include: { tenant: true }
  })

  if (!membership) {
    redirect('/onboarding')
  }

  const tenant = membership.tenant
  const isAdmin = ['OWNER', 'ADMIN'].includes(membership.role)

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          href: '/settings/profile',
          icon: '👤',
          label: 'Profilo',
          description: 'Modifica i tuoi dati personali'
        },
        {
          href: '/settings/security',
          icon: '🔐',
          label: 'Sicurezza',
          description: 'Password e autenticazione'
        },
        {
          href: '/settings/notifications',
          icon: '🔔',
          label: 'Notifiche',
          description: 'Preferenze email e avvisi'
        }
      ]
    },
    {
      title: 'Studio',
      items: [
        {
          href: '/settings/branding',
          icon: '🎨',
          label: 'Personalizzazione',
          description: 'Logo, colori e brand',
          adminOnly: true
        },
        {
          href: '/settings/team',
          icon: '👥',
          label: 'Team',
          description: 'Gestisci utenti e permessi',
          adminOnly: true
        },
        {
          href: '/settings/billing',
          icon: '💳',
          label: 'Abbonamento',
          description: 'Piano e fatturazione',
          adminOnly: true
        }
      ]
    },
    {
      title: 'Integrazioni',
      items: [
        {
          href: '/settings/integrations',
          icon: '🔗',
          label: 'Integrazioni',
          description: 'Collega servizi esterni',
          adminOnly: true
        },
        {
          href: '/settings/api',
          icon: '🔑',
          label: 'API Keys',
          description: 'Chiavi per integrazione API',
          adminOnly: true,
          premium: true
        }
      ]
    }
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Impostazioni</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Gestisci il tuo account e le preferenze</p>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Piano attuale</p>
            <p className="text-2xl font-bold">{tenant.plan}</p>
            {tenant.subscriptionStatus === 'TRIAL' && tenant.trialEndsAt && (
              <p className="text-blue-200 text-sm mt-1">
                Prova gratuita fino al {new Date(tenant.trialEndsAt).toLocaleDateString('it-IT')}
              </p>
            )}
          </div>
          {tenant.plan !== 'ENTERPRISE' && tenant.plan !== 'PARTNER' && (
            <Link
              href="/settings/billing"
              className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50"
            >
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Settings Groups */}
      <div className="space-y-8">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{group.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.items.map((item) => {
                const disabled = ('adminOnly' in item && item.adminOnly) && !isAdmin
                const isPremium = ('premium' in item && item.premium) && tenant.plan === 'STARTER'

                return (
                  <Link
                    key={item.href}
                    href={disabled || isPremium ? '#' : item.href}
                    className={`block bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 transition-all ${
                      disabled || isPremium
                        ? 'opacity-50 cursor-not-allowed pointer-events-none'
                        : 'hover:shadow-md hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">{item.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{item.label}</h3>
                          {'adminOnly' in item && item.adminOnly && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              Admin
                            </span>
                          )}
                          {'premium' in item && item.premium && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      {isAdmin && (
        <div className="mt-12 bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-4">Zona Pericolosa</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-800">Esporta tutti i dati</p>
              <p className="text-sm text-red-600">Scarica un backup completo dei tuoi dati</p>
            </div>
            <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-100">
              Esporta Dati
            </button>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-red-200">
            <div>
              <p className="font-medium text-red-800">Elimina account</p>
              <p className="text-sm text-red-600">Questa azione e irreversibile</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Elimina Account
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
