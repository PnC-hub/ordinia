'use client'

import { useEffect, useState } from 'react'
import SidebarManager from './SidebarManager'
import SidebarEmployee from './SidebarEmployee'
import SidebarConsultant from './SidebarConsultant'

interface Client {
  id: string
  name: string
  employeeCount: number
  pendingTasks: number
}

interface SidebarProps {
  role: 'OWNER' | 'EMPLOYEE' | 'CONSULTANT'
  // Employee props
  pendingSignatures?: number
  pendingLeaves?: number
  unreadNotifications?: number
  // Consultant props
  clients?: Client[]
  selectedClientId?: string | null
  onClientChange?: (clientId: string | null) => void
}

export default function Sidebar({
  role,
  pendingSignatures = 0,
  pendingLeaves = 0,
  unreadNotifications = 0,
  clients = [],
  selectedClientId = null,
  onClientChange,
}: SidebarProps) {
  switch (role) {
    case 'EMPLOYEE':
      return (
        <SidebarEmployee
          pendingSignatures={pendingSignatures}
          pendingLeaves={pendingLeaves}
          unreadNotifications={unreadNotifications}
        />
      )
    case 'CONSULTANT':
      return (
        <SidebarConsultant
          clients={clients}
          selectedClientId={selectedClientId}
          onClientChange={onClientChange}
        />
      )
    case 'OWNER':
    default:
      return <SidebarManager />
  }
}

// Export individual components
export { SidebarManager, SidebarEmployee, SidebarConsultant }
