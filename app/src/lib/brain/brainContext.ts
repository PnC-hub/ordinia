// src/lib/brain/brainContext.ts
import { prisma } from '@/lib/prisma'

export interface BrainContext {
  report: string
  rawData: Record<string, unknown>
}

export async function buildBrainContext(
  userId: string,
  tenantId?: string | null
): Promise<BrainContext> {
  const today = new Date()
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Query parallele su dati Ordinia
  const [
    employeesResult,
    deadlinesResult,
    signaturesResult,
    safetyResult,
    manualsResult,
    checklistsResult,
    disciplinaryResult,
  ] = await Promise.allSettled([
    // 1. Dipendenti attivi
    prisma.employee.findMany({
      where: tenantId ? { tenantId, status: 'ACTIVE' } : { status: 'ACTIVE' },
      select: {
        firstName: true,
        lastName: true,
        jobTitle: true,
        department: true,
        hireDate: true,
        contractType: true,
        ccnlLevel: true,
      },
      take: 50,
      orderBy: { lastName: 'asc' },
    }),

    // 2. Scadenze urgenti (entro 30 giorni)
    prisma.deadline.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        dueDate: { lte: in30Days, gte: today },
        status: { in: ['PENDING', 'UPCOMING'] },
      },
      select: { title: true, type: true, dueDate: true, status: true },
      orderBy: { dueDate: 'asc' },
      take: 20,
    }),

    // 3. Firme documenti pendenti
    prisma.documentSignatureRequest.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        status: 'PENDING',
      },
      select: { documentId: true, requestedAt: true, dueDate: true },
      take: 20,
    }),

    // 4. Formazioni sicurezza in scadenza (campo: expiresAt)
    prisma.safetyTraining.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        expiresAt: { lte: in30Days },
        status: { not: 'COMPLETED' },
      },
      select: {
        trainingType: true,
        title: true,
        expiresAt: true,
        status: true,
        employee: { select: { firstName: true, lastName: true } },
      },
      take: 20,
    }),

    // 5. Categorie manuali
    prisma.manualCategory.findMany({
      where: tenantId ? { tenantId } : {},
      select: {
        name: true,
        _count: { select: { articles: true } },
      },
      take: 20,
    }),

    // 6. Checklist recenti (campo: name, non title)
    prisma.manualChecklist.findMany({
      where: tenantId ? { tenantId } : {},
      select: {
        name: true,
        _count: { select: { executions: true } },
      },
      take: 10,
    }),

    // 7. Procedure disciplinari aperte
    // DisciplinaryStatus validi: DRAFT, CONTESTATION_SENT, AWAITING_DEFENSE,
    //   DEFENSE_RECEIVED, HEARING_SCHEDULED, PENDING_DECISION, SANCTION_ISSUED, APPEALED, CLOSED
    prisma.disciplinaryProcedure.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        status: {
          in: [
            'DRAFT',
            'CONTESTATION_SENT',
            'AWAITING_DEFENSE',
            'DEFENSE_RECEIVED',
            'HEARING_SCHEDULED',
            'PENDING_DECISION',
          ],
        },
      },
      select: { infractionType: true, status: true, createdAt: true },
      take: 10,
    }),
  ])

  const extract = <T>(r: PromiseSettledResult<T>): T | null =>
    r.status === 'fulfilled' ? r.value : null

  const employees = extract(employeesResult) ?? []
  const deadlines = extract(deadlinesResult) ?? []
  const signatures = extract(signaturesResult) ?? []
  const safetyTrainings = extract(safetyResult) ?? []
  const manualCategories = extract(manualsResult) ?? []
  const checklists = extract(checklistsResult) ?? []
  const disciplinary = extract(disciplinaryResult) ?? []

  const sections: string[] = []

  sections.push(
    
  )

  if (employees.length > 0) {
    sections.push()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    employees.slice(0, 20).forEach((e: any) => {
      sections.push(
        
      )
    })
  }

  if (deadlines.length > 0) {
    sections.push()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deadlines.forEach((d: any) => {
      const giorni = Math.ceil(
        (new Date(d.dueDate).getTime() - today.getTime()) / 86400000
      )
      sections.push(
        
      )
    })
  }

  if (signatures.length > 0) {
    sections.push()
  }

  if (safetyTrainings.length > 0) {
    sections.push()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    safetyTrainings.forEach((t: any) => {
      const scadenza = t.expiresAt
        ? new Date(t.expiresAt).toLocaleDateString('it-IT')
        : 'N/D'
      sections.push(
        
      )
    })
  }

  if (manualCategories.length > 0) {
    sections.push()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    manualCategories.forEach((c: any) => {
      sections.push()
    })
  }

  if (checklists.length > 0) {
    sections.push()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checklists.forEach((c: any) => {
      sections.push()
    })
  }

  if (disciplinary.length > 0) {
    sections.push()
  }

  const rawData = {
    employees,
    deadlines,
    signatures,
    safetyTrainings,
    manualCategories,
    checklists,
    disciplinary,
  }

  return { report: sections.join('\n'), rawData }
}
