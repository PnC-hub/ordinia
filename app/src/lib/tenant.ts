import { headers } from 'next/headers'
import { prisma } from './prisma'

export async function getCurrentTenant() {
  const headersList = await headers()
  const host = headersList.get('host') || ''

  // Extract subdomain: studio-rossi.geniushr.it -> studio-rossi
  const subdomain = host.split('.')[0]

  // Check for custom domain first
  let tenant = await prisma.tenant.findFirst({
    where: { customDomain: host }
  })

  // Fallback to subdomain
  if (!tenant && subdomain !== 'www' && subdomain !== 'app') {
    tenant = await prisma.tenant.findUnique({
      where: { slug: subdomain }
    })
  }

  return tenant
}

export async function getTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({
    where: { slug },
    include: {
      members: {
        include: { user: true }
      }
    }
  })
}

export async function createTenant(data: {
  name: string
  slug: string
  ownerEmail: string
  ownerName: string
  plan?: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'PARTNER'
}) {
  const { name, slug, ownerEmail, ownerName, plan = 'STARTER' } = data

  // Create user and tenant in transaction
  return prisma.$transaction(async (tx) => {
    // Create or find user
    let user = await tx.user.findUnique({ where: { email: ownerEmail } })

    if (!user) {
      user = await tx.user.create({
        data: {
          email: ownerEmail,
          name: ownerName,
          role: 'ADMIN'
        }
      })
    }

    // Create tenant
    const tenant = await tx.tenant.create({
      data: {
        name,
        slug,
        plan,
        subscriptionStatus: 'TRIAL',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        members: {
          create: {
            userId: user.id,
            role: 'OWNER'
          }
        }
      }
    })

    return { tenant, user }
  })
}

export function getPlanLimits(plan: string) {
  const limits = {
    STARTER: { maxEmployees: 5, features: ['portal', 'documents', 'deadlines'] },
    PROFESSIONAL: { maxEmployees: 15, features: ['portal', 'documents', 'deadlines', 'performance', 'onboarding', 'disciplinary', 'gdpr'] },
    ENTERPRISE: { maxEmployees: Infinity, features: ['portal', 'documents', 'deadlines', 'performance', 'onboarding', 'disciplinary', 'gdpr', 'multisite', 'api', 'reports'] },
    PARTNER: { maxEmployees: Infinity, features: ['portal', 'documents', 'deadlines', 'performance', 'onboarding', 'disciplinary', 'gdpr', 'multisite', 'api', 'reports', 'whitelabel'] }
  }

  return limits[plan as keyof typeof limits] || limits.STARTER
}
