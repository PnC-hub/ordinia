// src/lib/brain/brainContext.ts
import { prisma } from '@/lib/prisma'

const MAX_ARTICLE_CHARS = 1500

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

  const [
    employeesResult,
    deadlinesResult,
    signaturesResult,
    safetyResult,
    manualsResult,
    checklistsResult,
    disciplinaryResult,
    manualArticlesResult,
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

    // 2. Scadenze urgenti
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

    // 4. Formazioni sicurezza in scadenza
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

    // 5. Categorie manuali (conteggio)
    prisma.manualCategory.findMany({
      where: tenantId ? { tenantId } : {},
      select: {
        name: true,
        _count: { select: { articles: true } },
      },
      take: 20,
    }),

    // 6. Checklist
    prisma.manualChecklist.findMany({
      where: tenantId ? { tenantId } : {},
      select: {
        name: true,
        _count: { select: { executions: true } },
      },
      take: 10,
    }),

    // 7. Procedure disciplinari aperte
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

    // 8. Articoli manuale con contenuto completo
    prisma.manualArticle.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        status: 'PUBLISHED',
      },
      select: {
        title: true,
        content: true,
        category: { select: { name: true } },
        updatedAt: true,
      },
      orderBy: [
        { category: { order: 'asc' } },
        { order: 'asc' },
      ],
      take: 50,
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
  const manualArticles = extract(manualArticlesResult) ?? []

  const sections: string[] = []

  // --- Dipendenti ---
  if (employees.length > 0) {
    sections.push(`\n## DIPENDENTI ATTIVI (${employees.length})`)
    employees.slice(0, 20).forEach((e: any) => {
      const hired = e.hireDate
        ? new Date(e.hireDate).toLocaleDateString('it-IT')
        : 'N/D'
      sections.push(
        `- ${e.lastName} ${e.firstName} | ${e.jobTitle ?? 'N/D'} | ${e.department ?? 'N/D'} | Assunto: ${hired} | Contratto: ${e.contractType ?? 'N/D'} ${e.ccnlLevel ? '| Livello: ' + e.ccnlLevel : ''}`
      )
    })
  }

  // --- Scadenze ---
  if (deadlines.length > 0) {
    sections.push(`\n## SCADENZE URGENTI (entro 30 giorni)`)
    deadlines.forEach((d: any) => {
      const due = new Date(d.dueDate).toLocaleDateString('it-IT')
      sections.push(`- [${d.status}] ${d.title} — scade ${due} (${d.type})`)
    })
  }

  // --- Firme pendenti ---
  if (signatures.length > 0) {
    sections.push(`\n## FIRME DOCUMENTI PENDENTI (${signatures.length})`)
    signatures.forEach((s: any) => {
      const req = new Date(s.requestedAt).toLocaleDateString('it-IT')
      const due = s.dueDate ? new Date(s.dueDate).toLocaleDateString('it-IT') : 'N/D'
      sections.push(`- Documento ID: ${s.documentId} | Richiesto: ${req} | Scadenza: ${due}`)
    })
  }

  // --- Sicurezza ---
  if (safetyTrainings.length > 0) {
    sections.push(`\n## FORMAZIONI SICUREZZA IN SCADENZA`)
    safetyTrainings.forEach((t: any) => {
      const exp = t.expiresAt
        ? new Date(t.expiresAt).toLocaleDateString('it-IT')
        : 'N/D'
      const name = t.employee
        ? `${t.employee.lastName} ${t.employee.firstName}`
        : 'N/D'
      sections.push(`- ${name}: "${t.title}" (${t.trainingType}) — scade ${exp} [${t.status}]`)
    })
  }

  // --- Struttura manuale ---
  if (manualCategories.length > 0) {
    sections.push(`\n## STRUTTURA MANUALE AZIENDALE`)
    manualCategories.forEach((c: any) => {
      sections.push(`- ${c.name}: ${c._count.articles} articoli`)
    })
  }

  // --- Contenuto articoli manuale ---
  if (manualArticles.length > 0) {
    sections.push(`\n## CONTENUTO MANUALE AZIENDALE (Protocolli e Regole)`)

    const byCategory = new Map<string, any[]>()
    for (const art of manualArticles as any[]) {
      const catName = art.category?.name ?? 'Generale'
      if (!byCategory.has(catName)) byCategory.set(catName, [])
      byCategory.get(catName)!.push(art)
    }

    byCategory.forEach((articles, catName) => {
      sections.push(`\n### ${catName}`)
      articles.forEach((art: any) => {
        const updated = new Date(art.updatedAt).toLocaleDateString('it-IT')
        sections.push(`\n#### ${art.title} (aggiornato: ${updated})`)
        const truncated = art.content.length > MAX_ARTICLE_CHARS
          ? art.content.slice(0, MAX_ARTICLE_CHARS) + '… [troncato]'
          : art.content
        sections.push(truncated)
      })
    })
  }

  // --- Checklist ---
  if (checklists.length > 0) {
    sections.push(`\n## CHECKLIST OPERATIVE`)
    checklists.forEach((c: any) => {
      sections.push(`- ${c.name}: ${c._count.executions} esecuzioni completate`)
    })
  }

  // --- Disciplinare ---
  if (disciplinary.length > 0) {
    sections.push(`\n## PROCEDURE DISCIPLINARI APERTE (${disciplinary.length})`)
    disciplinary.forEach((d: any) => {
      const date = new Date(d.createdAt).toLocaleDateString('it-IT')
      sections.push(`- [${d.status}] ${d.infractionType} — aperta il ${date}`)
    })
  }

  const rawData = {
    employees,
    deadlines,
    signatures,
    safetyTrainings,
    manualCategories,
    checklists,
    disciplinary,
    manualArticles,
  }

  return { report: sections.join('\n'), rawData }
}
