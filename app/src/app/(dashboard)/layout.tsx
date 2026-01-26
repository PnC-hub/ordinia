import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardLayoutClient from './DashboardLayoutClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Get user's role and tenant info
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tenant: true,
      employee: {
        include: {
          tenant: true,
        },
      },
      consultantClients: {
        include: {
          tenant: true,
        },
      },
    },
  })

  if (!user) {
    redirect('/login')
  }

  // Determine role
  let role: 'OWNER' | 'EMPLOYEE' | 'CONSULTANT' = 'OWNER'
  let tenantId: string | null = user.tenantId || null

  if (user.consultantClients && user.consultantClients.length > 0) {
    role = 'CONSULTANT'
  } else if (user.employee && !user.tenantId) {
    role = 'EMPLOYEE'
    tenantId = user.employee.tenantId
  }

  // Get consultant clients if applicable
  const clients = user.consultantClients?.map((cc) => ({
    id: cc.tenant.id,
    name: cc.tenant.name,
    employeeCount: 0, // Will be populated in client
    pendingTasks: 0,
  })) || []

  // Get pending signatures and notifications for employees
  let pendingSignatures = 0
  let pendingLeaves = 0
  let unreadNotifications = 0

  if (role === 'EMPLOYEE' && user.employee) {
    // Count pending signatures
    const signatures = await prisma.documentSignatureRequest.count({
      where: {
        employeeId: user.employee.id,
        status: 'PENDING',
      },
    })
    pendingSignatures = signatures

    // Count pending leaves
    const leaves = await prisma.leaveRequest.count({
      where: {
        employeeId: user.employee.id,
        status: 'PENDING',
      },
    })
    pendingLeaves = leaves

    // Count unread notifications
    const notifications = await prisma.notification.count({
      where: {
        userId: user.id,
        readAt: null,
      },
    })
    unreadNotifications = notifications
  }

  return (
    <DashboardLayoutClient
      user={{
        name: session.user.name,
        email: session.user.email,
        role,
      }}
      role={role}
      clients={clients}
      pendingSignatures={pendingSignatures}
      pendingLeaves={pendingLeaves}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </DashboardLayoutClient>
  )
}
