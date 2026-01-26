import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Impostazioni</h1>
      <p className="mt-2">Piano: {membership.tenant.plan}</p>
      <p>Ruolo: {membership.role}</p>
    </div>
  )
}
