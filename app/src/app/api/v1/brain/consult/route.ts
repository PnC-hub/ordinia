// app/api/v1/brain/consult/route.ts
// Ordinia inter-agent consult — risponde a domande HR dal Brain di Imperum
// Auth: x-inter-agent-secret header
// Tenant: ORDINIA_BRAIN_TENANT_SLUG env var (specifica l'azienda del proprietario)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─── AUTH ──────────────────────────────────────────────────────────────────

function checkSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-inter-agent-secret')
  return !!secret && secret === process.env.INTER_AGENT_SECRET
}

// ─── TENANT ────────────────────────────────────────────────────────────────

async function getBrainTenant() {
  const slug = process.env.ORDINIA_BRAIN_TENANT_SLUG
  const id = process.env.ORDINIA_BRAIN_TENANT_ID

  if (id) return prisma.tenant.findUnique({ where: { id } })
  if (slug) return prisma.tenant.findUnique({ where: { slug } })
  return null
}

// ─── INTENT DETECTION ──────────────────────────────────────────────────────

type Intent =
  | 'employees_overview'
  | 'employees_list'
  | 'contracts'
  | 'leaves'
  | 'payslips_costs'
  | 'deadlines'
  | 'performance'
  | 'onboarding'
  | 'disciplinary'
  | 'overview'

function detectIntent(question: string): Intent {
  const q = question.toLowerCase()

  if (/assenz|ferie|permess|malatt|congedo|leave/.test(q)) return 'leaves'
  if (/busta\s*paga|payslip|stipend|costo\s*(del\s*)?person|salary|ral/.test(q)) return 'payslips_costs'
  if (/contratt|ccnl|part.time|full.time|apprendist|tempo\s*determ/.test(q)) return 'contracts'
  if (/scadenz|deadline|documento\s*in\s*scadenz/.test(q)) return 'deadlines'
  if (/performance|valutazion|review/.test(q)) return 'performance'
  if (/onboarding|nuovo\s*assunt|inseriment/.test(q)) return 'onboarding'
  if (/disciplin|provvediment|sanzione/.test(q)) return 'disciplinary'
  if (/lista|elenco|tutti\s*i\s*dipendent|quanti\s*dipendent/.test(q)) return 'employees_list'
  if (/dipendent|headcount|team|organico|assunt/.test(q)) return 'employees_overview'
  return 'overview'
}

// ─── DATA FETCHERS ─────────────────────────────────────────────────────────

async function getEmployeesOverview(tenantId: string) {
  const [total, byStatus, byContract] = await Promise.all([
    prisma.employee.count({ where: { tenantId } }),
    prisma.employee.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true,
    }),
    prisma.employee.groupBy({
      by: ['contractType'],
      where: { tenantId },
      _count: true,
    }),
  ])

  return {
    totalDipendenti: total,
    perStato: Object.fromEntries(byStatus.map(r => [r.status, r._count])),
    perContratto: Object.fromEntries(byContract.map(r => [r.contractType, r._count])),
  }
}

async function getEmployeesList(tenantId: string) {
  return prisma.employee.findMany({
    where: { tenantId, status: { not: 'TERMINATED' } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      jobTitle: true,
      department: true,
      contractType: true,
      status: true,
      hireDate: true,
    },
    orderBy: [{ department: 'asc' }, { lastName: 'asc' }],
  })
}

async function getContractsInfo(tenantId: string) {
  const employees = await prisma.employee.findMany({
    where: { tenantId, status: { not: 'TERMINATED' } },
    select: {
      firstName: true,
      lastName: true,
      contractType: true,
      ccnlLevel: true,
      hireDate: true,
      endDate: true,
      status: true,
    },
  })

  const scadenze = employees.filter(e => e.endDate).map(e => ({
    nome: `${e.firstName} ${e.lastName}`,
    tipo: e.contractType,
    scadenza: e.endDate,
  }))

  return { dipendenti: employees, contratti_in_scadenza: scadenze }
}

async function getLeavesInfo(tenantId: string) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [pending, thisMonth, balances] = await Promise.all([
    prisma.leaveRequest.count({
      where: { tenantId, status: 'PENDING' },
    }),
    prisma.leaveRequest.findMany({
      where: {
        tenantId,
        startDate: { gte: startMonth },
        endDate: { lte: endMonth },
      },
      include: {
        employee: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.leaveBalance.findMany({
      where: { tenantId, year: currentYear },
      include: { employee: { select: { firstName: true, lastName: true } } },
    }),
  ])

  return {
    richiestePendenti: pending,
    assenzeMeseCorrente: thisMonth.map(r => ({
      dipendente: `${r.employee.firstName} ${r.employee.lastName}`,
      tipo: r.type,
      dal: r.startDate,
      al: r.endDate,
      stato: r.status,
    })),
    saldiFerie: balances.map(b => ({
      dipendente: `${b.employee.firstName} ${b.employee.lastName}`,
      ferieTotal: Number(b.vacationTotal),
      ferieUsate: Number(b.vacationUsed),
      feriePendenti: Number(b.vacationPending),
      ferieResiduo: Number(b.vacationTotal) - Number(b.vacationUsed) - Number(b.vacationPending),
      rolTotal: Number(b.rolTotal),
      rolUsato: Number(b.rolUsed),
      malattiaGiorni: b.sickDaysUsed,
    })),
  }
}

async function getPayslipsCosts(tenantId: string) {
  const now = new Date()
  // Calcola il periodo minimo in formato YYYY-MM (3 mesi fa)
  const minDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const minPeriod = `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}`

  const payslips = await prisma.payslip.findMany({
    where: {
      tenantId,
      period: { gte: minPeriod },
    },
    select: {
      period: true,
      grossAmount: true,
      netAmount: true,
      employee: { select: { firstName: true, lastName: true, department: true } },
    },
    orderBy: { period: 'desc' },
  })

  const totali = payslips.reduce(
    (acc, p) => {
      acc.lordoTot += Number(p.grossAmount ?? 0)
      acc.nettoTot += Number(p.netAmount ?? 0)
      return acc
    },
    { lordoTot: 0, nettoTot: 0 },
  )

  return {
    ultimi3Mesi: {
      costoLordo: Math.round(totali.lordoTot),
      nettoErogato: Math.round(totali.nettoTot),
    },
    bustePaga: payslips.map(p => ({
      dipendente: `${p.employee.firstName} ${p.employee.lastName}`,
      reparto: p.employee.department,
      periodo: p.period,
      lordo: p.grossAmount,
      netto: p.netAmount,
    })),
  }
}

async function getDeadlines(tenantId: string) {
  const in30Days = new Date()
  in30Days.setDate(in30Days.getDate() + 30)

  const deadlines = await prisma.deadline.findMany({
    where: {
      tenantId,
      dueDate: { lte: in30Days },
      status: { not: 'COMPLETED' },
    },
    include: {
      employee: { select: { firstName: true, lastName: true } },
    },
    orderBy: { dueDate: 'asc' },
  })

  return {
    scadenzeImminenti: deadlines.map(d => ({
      dipendente: d.employee ? `${d.employee.firstName} ${d.employee.lastName}` : 'Aziendale',
      tipo: d.type,
      titolo: d.title,
      scadenza: d.dueDate,
      urgente: d.dueDate <= new Date(),
    })),
    totale: deadlines.length,
  }
}

async function getOverview(tenantId: string) {
  const [employees, pendingLeaves, upcomingDeadlines, pendingOnboarding] = await Promise.all([
    prisma.employee.count({ where: { tenantId, status: 'ACTIVE' } }),
    prisma.leaveRequest.count({ where: { employee: { tenantId }, status: 'PENDING' } }),
    prisma.deadline.count({
      where: {
        tenantId,
        status: { not: 'COMPLETED' },
        dueDate: { lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.onboardingItem.count({
      where: { employee: { tenantId }, completed: false },
    }),
  ])

  return {
    dipendentiAttivi: employees,
    richiesteCongedoPendenti: pendingLeaves,
    scadenzeDocumentali14gg: upcomingDeadlines,
    itemOnboardingAperti: pendingOnboarding,
  }
}

// ─── MAIN HANDLER ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!checkSecret(request)) {
    return NextResponse.json({ error: 'Inter-agent secret non valido' }, { status: 401 })
  }

  let body: { question?: string; context?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON non valido' }, { status: 400 })
  }

  const question = body.question?.trim()
  if (!question) {
    return NextResponse.json({ error: 'question richiesta' }, { status: 400 })
  }

  const tenant = await getBrainTenant()
  if (!tenant) {
    return NextResponse.json(
      {
        answer: 'Tenant non configurato. Impostare ORDINIA_BRAIN_TENANT_SLUG o ORDINIA_BRAIN_TENANT_ID.',
        confidence: 0,
        caveats: ['Tenant non trovato'],
      },
      { status: 200 },
    )
  }

  const intent = detectIntent(question)
  let data: unknown
  let answer: string

  try {
    switch (intent) {
      case 'employees_overview': {
        data = await getEmployeesOverview(tenant.id)
        const d = data as Awaited<ReturnType<typeof getEmployeesOverview>>
        answer = `Organico Ordinia: ${d.totalDipendenti} dipendenti totali. Attivi: ${d.perStato['ACTIVE'] ?? 0}, In prova: ${d.perStato['PROBATION'] ?? 0}, In aspettativa: ${d.perStato['ON_LEAVE'] ?? 0}.`
        break
      }
      case 'employees_list': {
        data = await getEmployeesList(tenant.id)
        const list = data as Awaited<ReturnType<typeof getEmployeesList>>
        answer = `Lista dipendenti attivi (${list.length}): ${list.map(e => `${e.firstName} ${e.lastName} — ${e.jobTitle ?? 'N/D'} (${e.department ?? 'N/D'})`).join('; ')}.`
        break
      }
      case 'contracts': {
        data = await getContractsInfo(tenant.id)
        const d = data as Awaited<ReturnType<typeof getContractsInfo>>
        answer = `Contratti: ${d.dipendenti.length} dipendenti. Scadenze prossime: ${d.contratti_in_scadenza.length > 0 ? d.contratti_in_scadenza.map(c => `${c.nome} (${c.scadenza?.toISOString().slice(0, 10)})`).join(', ') : 'nessuna'}.`
        break
      }
      case 'leaves': {
        data = await getLeavesInfo(tenant.id)
        const d = data as Awaited<ReturnType<typeof getLeavesInfo>>
        answer = `Ferie/assenze: ${d.richiestePendenti} richieste pendenti, ${d.assenzeMeseCorrente.length} assenze nel mese corrente.`
        break
      }
      case 'payslips_costs': {
        data = await getPayslipsCosts(tenant.id)
        const d = data as Awaited<ReturnType<typeof getPayslipsCosts>>
        answer = `Costo personale ultimi 3 mesi: lordo €${d.ultimi3Mesi.costoLordo.toLocaleString('it-IT')}, netto erogato €${d.ultimi3Mesi.nettoErogato.toLocaleString('it-IT')}.`
        break
      }
      case 'deadlines': {
        data = await getDeadlines(tenant.id)
        const d = data as Awaited<ReturnType<typeof getDeadlines>>
        answer = `Scadenze documentali entro 30 giorni: ${d.totale} totali. ${d.scadenzeImminenti.filter(s => s.urgente).length} già scadute.`
        break
      }
      case 'overview':
      default: {
        data = await getOverview(tenant.id)
        const d = data as Awaited<ReturnType<typeof getOverview>>
        answer = `HR Overview Ordinia — Dipendenti attivi: ${d.dipendentiAttivi}, richieste congedo pendenti: ${d.richiesteCongedoPendenti}, scadenze documentali 14gg: ${d.scadenzeDocumentali14gg}, onboarding aperti: ${d.itemOnboardingAperti}.`
        break
      }
    }

    return NextResponse.json({
      answer,
      confidence: 0.9,
      intent,
      tenant: tenant.name,
      data,
      caveats: [],
    })
  } catch (err) {
    console.error('[Ordinia Brain] Errore query:', err)
    return NextResponse.json({
      answer: 'Errore nel recupero dati HR da Ordinia.',
      confidence: 0,
      caveats: ['Database error'],
    })
  }
}
