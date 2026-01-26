'use client'

import { useState } from 'react'
import DashboardShell from '@/components/layout/DashboardShell'
import Sidebar from '@/components/sidebar'

interface Client {
  id: string
  name: string
  employeeCount: number
  pendingTasks: number
}

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: {
    name?: string | null
    email?: string | null
    role: 'OWNER' | 'EMPLOYEE' | 'CONSULTANT'
  }
  role: 'OWNER' | 'EMPLOYEE' | 'CONSULTANT'
  clients: Client[]
  pendingSignatures: number
  pendingLeaves: number
  unreadNotifications: number
}

export default function DashboardLayoutClient({
  children,
  user,
  role,
  clients,
  pendingSignatures,
  pendingLeaves,
  unreadNotifications,
}: DashboardLayoutClientProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const brandColor =
    role === 'EMPLOYEE' ? 'green' : role === 'CONSULTANT' ? 'purple' : 'blue'

  return (
    <DashboardShell
      user={user}
      brandColor={brandColor}
      sidebar={
        <Sidebar
          role={role}
          pendingSignatures={pendingSignatures}
          pendingLeaves={pendingLeaves}
          unreadNotifications={unreadNotifications}
          clients={clients}
          selectedClientId={selectedClientId}
          onClientChange={setSelectedClientId}
        />
      }
    >
      {children}
    </DashboardShell>
  )
}
