import { TenantRole } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Tipi per i permessi
export type Permission =
  | 'employees:read'
  | 'employees:write'
  | 'employees:delete'
  | 'employees:notes:read'
  | 'employees:notes:write'
  | 'documents:read'
  | 'documents:write'
  | 'documents:delete'
  | 'documents:assign'
  | 'signatures:request'
  | 'signatures:view_audit'
  | 'payslips:read'
  | 'payslips:write'
  | 'payslips:bulk_upload'
  | 'attendance:read'
  | 'attendance:write'
  | 'attendance:approve'
  | 'attendance:reports'
  | 'leave:read'
  | 'leave:write'
  | 'leave:approve'
  | 'leave:manage_balance'
  | 'expenses:read'
  | 'expenses:write'
  | 'expenses:approve'
  | 'compliance:read'
  | 'compliance:write'
  | 'audit:read'
  | 'settings:read'
  | 'settings:write'
  | 'billing:read'
  | 'billing:write'
  | 'invites:send'
  | 'consultant:multi_tenant'

// Mappa ruoli -> permessi
const rolePermissions: Record<TenantRole, Permission[]> = {
  OWNER: [
    'employees:read', 'employees:write', 'employees:delete', 'employees:notes:read', 'employees:notes:write',
    'documents:read', 'documents:write', 'documents:delete', 'documents:assign',
    'signatures:request', 'signatures:view_audit',
    'payslips:read', 'payslips:write', 'payslips:bulk_upload',
    'attendance:read', 'attendance:write', 'attendance:approve', 'attendance:reports',
    'leave:read', 'leave:write', 'leave:approve', 'leave:manage_balance',
    'expenses:read', 'expenses:write', 'expenses:approve',
    'compliance:read', 'compliance:write',
    'audit:read',
    'settings:read', 'settings:write',
    'billing:read', 'billing:write',
    'invites:send',
  ],
  ADMIN: [
    'employees:read', 'employees:write', 'employees:notes:read', 'employees:notes:write',
    'documents:read', 'documents:write', 'documents:assign',
    'signatures:request', 'signatures:view_audit',
    'payslips:read', 'payslips:write',
    'attendance:read', 'attendance:write', 'attendance:approve', 'attendance:reports',
    'leave:read', 'leave:write', 'leave:approve', 'leave:manage_balance',
    'expenses:read', 'expenses:write', 'expenses:approve',
    'compliance:read', 'compliance:write',
    'audit:read',
    'settings:read',
    'invites:send',
  ],
  HR_MANAGER: [
    'employees:read', 'employees:write', 'employees:notes:read', 'employees:notes:write',
    'documents:read', 'documents:write', 'documents:assign',
    'signatures:request', 'signatures:view_audit',
    'payslips:read', 'payslips:write',
    'attendance:read', 'attendance:approve', 'attendance:reports',
    'leave:read', 'leave:approve', 'leave:manage_balance',
    'expenses:read', 'expenses:approve',
    'compliance:read',
    'audit:read',
  ],
  EMPLOYEE: [
    'documents:read', // Solo propri documenti
    'payslips:read',  // Solo proprie buste paga
    'attendance:read', 'attendance:write', // Solo proprie presenze
    'leave:read', 'leave:write', // Solo proprie ferie
    'expenses:read', 'expenses:write', // Solo proprie spese
  ],
}

// Permessi speciali per consulente (multi-tenant)
const consultantPermissions: Permission[] = [
  ...rolePermissions.OWNER,
  'consultant:multi_tenant',
  'payslips:bulk_upload',
]

// Interfaccia utente con ruolo
export interface UserWithRole {
  id: string
  name: string | null
  email: string | null
  role: TenantRole
  tenantId: string
  tenantName: string
  isConsultant: boolean
}

/**
 * Ottiene l'utente corrente con il suo ruolo nel tenant
 */
export async function getCurrentUser(tenantId?: string): Promise<UserWithRole | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  // Se è un consulente, verifica accesso multi-tenant
  const consultantAccess = await prisma.consultantClient.findFirst({
    where: {
      consultantId: session.user.id,
      isActive: true,
      ...(tenantId ? { tenantId } : {}),
    },
    include: { tenant: true },
  })

  if (consultantAccess) {
    return {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      role: 'OWNER' as TenantRole, // Consulente ha permessi OWNER sui clienti
      tenantId: consultantAccess.tenantId,
      tenantName: consultantAccess.tenant.name,
      isConsultant: true,
    }
  }

  // Altrimenti cerca membership normale
  const membership = await prisma.tenantMember.findFirst({
    where: {
      userId: session.user.id,
      ...(tenantId ? { tenantId } : {}),
    },
    include: { tenant: true },
  })

  if (!membership) return null

  return {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    role: membership.role,
    tenantId: membership.tenantId,
    tenantName: membership.tenant.name,
    isConsultant: false,
  }
}

/**
 * Verifica se l'utente ha un permesso specifico
 */
export function hasPermission(user: UserWithRole, permission: Permission): boolean {
  if (user.isConsultant) {
    return consultantPermissions.includes(permission)
  }
  return rolePermissions[user.role]?.includes(permission) ?? false
}

/**
 * Verifica se l'utente ha almeno uno dei permessi specificati
 */
export function hasAnyPermission(user: UserWithRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(user, p))
}

/**
 * Verifica se l'utente ha tutti i permessi specificati
 */
export function hasAllPermissions(user: UserWithRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(user, p))
}

/**
 * Ottiene tutti i permessi dell'utente
 */
export function getUserPermissions(user: UserWithRole): Permission[] {
  if (user.isConsultant) {
    return consultantPermissions
  }
  return rolePermissions[user.role] ?? []
}

/**
 * Verifica se l'utente è un manager (OWNER, ADMIN, HR_MANAGER)
 */
export function isManager(user: UserWithRole): boolean {
  return ['OWNER', 'ADMIN', 'HR_MANAGER'].includes(user.role) || user.isConsultant
}

/**
 * Verifica se l'utente è un dipendente semplice
 */
export function isEmployee(user: UserWithRole): boolean {
  return user.role === 'EMPLOYEE' && !user.isConsultant
}

/**
 * Ottiene tutti i tenant a cui l'utente ha accesso (per consulenti)
 */
export async function getUserTenants(userId: string): Promise<{ id: string; name: string; role: TenantRole | 'CONSULTANT' }[]> {
  // Tenant diretti (membership)
  const memberships = await prisma.tenantMember.findMany({
    where: { userId },
    include: { tenant: true },
  })

  // Tenant come consulente
  const consultantAccess = await prisma.consultantClient.findMany({
    where: { consultantId: userId, isActive: true },
    include: { tenant: true },
  })

  const tenants: { id: string; name: string; role: TenantRole | 'CONSULTANT' }[] = []

  for (const m of memberships) {
    tenants.push({
      id: m.tenant.id,
      name: m.tenant.name,
      role: m.role,
    })
  }

  for (const c of consultantAccess) {
    // Evita duplicati
    if (!tenants.find(t => t.id === c.tenant.id)) {
      tenants.push({
        id: c.tenant.id,
        name: c.tenant.name,
        role: 'CONSULTANT',
      })
    }
  }

  return tenants
}

/**
 * Verifica accesso a un dipendente specifico
 * I dipendenti possono vedere solo se stessi
 */
export async function canAccessEmployee(user: UserWithRole, employeeId: string): Promise<boolean> {
  if (isManager(user)) {
    // Manager può vedere tutti i dipendenti del suo tenant
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, tenantId: user.tenantId },
    })
    return !!employee
  }

  // Dipendente può vedere solo se stesso
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, userId: user.id },
  })
  return !!employee
}

/**
 * Ottiene l'Employee collegato all'utente corrente (per dipendenti)
 */
export async function getEmployeeForUser(userId: string, tenantId: string): Promise<string | null> {
  const employee = await prisma.employee.findFirst({
    where: { userId, tenantId },
    select: { id: true },
  })
  return employee?.id ?? null
}

// Esporta i ruoli per comodità
export { TenantRole }
