import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Impostazioni</h1>
      <p className="mt-2">Benvenuto nelle impostazioni, {session.user?.name}!</p>
    </div>
  )
}
