import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/compliance/status - Get compliance status for tenant
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Get user's tenant membership
    const membership = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id },
      include: { tenant: true },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Nessun tenant associato' },
        { status: 403 }
      )
    }

    const tenantId = membership.tenantId

    // Get compliance metrics
    const [
      totalEmployees,
      employeesWithGdprConsent,
      overdueDeadlines,
      upcomingDeadlines,
      recentAuditLogs,
      documentsExpiringSoon,
      // New D.Lgs. 81/2008 metrics
      safetyTrainingExpired,
      safetyTrainingMissing,
      dvrAcknowledgmentsPending,
      // Disciplinary code
      disciplinaryCode,
      // Active procedures
      activeDisciplinaryProcedures,
      pendingWhistleblowingReports,
    ] = await Promise.all([
      // Total employees
      prisma.employee.count({
        where: { tenantId, status: { not: 'TERMINATED' } },
      }),

      // Employees with GDPR consent
      prisma.gdprConsent.groupBy({
        by: ['employeeId'],
        where: {
          tenantId,
          consentType: 'DATA_PROCESSING',
          granted: true,
        },
      }),

      // Overdue deadlines
      prisma.deadline.count({
        where: {
          tenantId,
          status: 'OVERDUE',
        },
      }),

      // Upcoming deadlines (next 30 days)
      prisma.deadline.count({
        where: {
          tenantId,
          status: { in: ['PENDING', 'UPCOMING'] },
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Recent audit logs (last 7 days)
      prisma.auditLog.count({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Documents expiring in next 30 days
      prisma.document.count({
        where: {
          tenantId,
          expiresAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Safety training expired
      prisma.safetyTraining.count({
        where: {
          tenantId,
          status: 'EXPIRED',
        },
      }),

      // Employees without mandatory safety training (general)
      prisma.employee.count({
        where: {
          tenantId,
          status: { not: 'TERMINATED' },
          safetyTrainings: {
            none: {
              trainingType: 'GENERAL',
              status: 'COMPLETED',
            },
          },
        },
      }),

      // DVR acknowledgments pending (employees without acknowledgment)
      prisma.employee.count({
        where: {
          tenantId,
          status: { not: 'TERMINATED' },
          dvrAcknowledgments: {
            none: {
              acknowledgedAt: { not: null },
            },
          },
        },
      }),

      // Disciplinary code
      prisma.disciplinaryCode.findUnique({
        where: { tenantId },
      }),

      // Active disciplinary procedures
      prisma.disciplinaryProcedure.count({
        where: {
          tenantId,
          status: {
            notIn: ['CLOSED', 'SANCTION_ISSUED'],
          },
        },
      }),

      // Pending whistleblowing reports (not acknowledged within 7 days)
      prisma.whistleblowingReport.count({
        where: {
          tenantId,
          status: { in: ['RECEIVED'] },
          createdAt: {
            lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    // Calculate compliance score (0-100)
    const gdprConsentRate =
      totalEmployees > 0
        ? (employeesWithGdprConsent.length / totalEmployees) * 100
        : 100

    // Safety training compliance rate
    const safetyTrainingRate =
      totalEmployees > 0
        ? ((totalEmployees - safetyTrainingMissing) / totalEmployees) * 100
        : 100

    // DVR compliance rate
    const dvrRate =
      totalEmployees > 0
        ? ((totalEmployees - dvrAcknowledgmentsPending) / totalEmployees) * 100
        : 100

    // Disciplinary code posted
    const disciplinaryCodePosted = disciplinaryCode?.postedAt ? 1 : 0

    // Calculate weighted score
    const overdueImpact = overdueDeadlines * 5
    const expiringDocsImpact = documentsExpiringSoon * 2
    const expiredTrainingImpact = safetyTrainingExpired * 3
    const missingTrainingImpact = safetyTrainingMissing * 3
    const pendingDvrImpact = dvrAcknowledgmentsPending * 2
    const missingCodeImpact = disciplinaryCodePosted ? 0 : 10
    const pendingWhistleblowingImpact = pendingWhistleblowingReports * 5

    const baseScore =
      (gdprConsentRate * 0.25) +
      (safetyTrainingRate * 0.25) +
      (dvrRate * 0.20) +
      (disciplinaryCodePosted * 15) + // 15 points for having code posted
      15 // Base points

    const complianceScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          baseScore -
            overdueImpact -
            expiringDocsImpact -
            expiredTrainingImpact -
            missingTrainingImpact -
            pendingDvrImpact -
            missingCodeImpact -
            pendingWhistleblowingImpact
        )
      )
    )

    // Compliance checklist items
    const checklist = [
      // GDPR
      {
        id: 'gdpr_consent',
        title: 'Consensi GDPR dipendenti',
        description: 'Tutti i dipendenti hanno firmato il consenso al trattamento dati',
        completed: employeesWithGdprConsent.length >= totalEmployees,
        count: employeesWithGdprConsent.length,
        total: totalEmployees,
        priority: 'high' as const,
        category: 'gdpr',
      },
      // D.Lgs. 81/2008 - Sicurezza
      {
        id: 'safety_training',
        title: 'Formazione sicurezza D.Lgs. 81/2008',
        description: 'Tutti i dipendenti hanno completato la formazione generale (4h)',
        completed: safetyTrainingMissing === 0,
        count: totalEmployees - safetyTrainingMissing,
        total: totalEmployees,
        priority: 'high' as const,
        category: 'safety',
      },
      {
        id: 'safety_training_valid',
        title: 'Formazioni sicurezza in corso di validità',
        description: 'Nessuna formazione scaduta',
        completed: safetyTrainingExpired === 0,
        count: safetyTrainingExpired,
        priority: 'high' as const,
        category: 'safety',
      },
      {
        id: 'dvr_acknowledgment',
        title: 'Presa visione DVR',
        description: 'Tutti i dipendenti hanno preso visione del DVR',
        completed: dvrAcknowledgmentsPending === 0,
        count: totalEmployees - dvrAcknowledgmentsPending,
        total: totalEmployees,
        priority: 'high' as const,
        category: 'safety',
      },
      // Art. 7 L. 300/1970 - Disciplinare
      {
        id: 'disciplinary_code',
        title: 'Codice disciplinare affisso',
        description: 'Codice disciplinare creato e affisso (Art. 7 L. 300/1970)',
        completed: !!disciplinaryCode?.postedAt,
        count: disciplinaryCode?.postedAt ? 1 : 0,
        total: 1,
        priority: 'high' as const,
        category: 'disciplinary',
      },
      // Scadenze
      {
        id: 'no_overdue',
        title: 'Nessuna scadenza in ritardo',
        description: 'Tutte le scadenze sono state gestite in tempo',
        completed: overdueDeadlines === 0,
        count: overdueDeadlines,
        priority: 'high' as const,
        category: 'deadlines',
      },
      {
        id: 'documents_valid',
        title: 'Documenti in corso di validità',
        description: 'Nessun documento in scadenza nei prossimi 30 giorni',
        completed: documentsExpiringSoon === 0,
        count: documentsExpiringSoon,
        priority: 'medium' as const,
        category: 'documents',
      },
      // Whistleblowing D.Lgs. 24/2023
      {
        id: 'whistleblowing_response',
        title: 'Segnalazioni whistleblowing gestite',
        description: 'Tutte le segnalazioni prese in carico entro 7 giorni',
        completed: pendingWhistleblowingReports === 0,
        count: pendingWhistleblowingReports,
        priority: 'high' as const,
        category: 'whistleblowing',
      },
      // Audit
      {
        id: 'audit_active',
        title: 'Audit log attivo',
        description: 'Sistema di tracciamento operazioni funzionante',
        completed: recentAuditLogs > 0 || totalEmployees === 0,
        count: recentAuditLogs,
        priority: 'low' as const,
        category: 'audit',
      },
    ]

    // Status level
    let statusLevel: 'excellent' | 'good' | 'warning' | 'critical'
    if (complianceScore >= 90) statusLevel = 'excellent'
    else if (complianceScore >= 70) statusLevel = 'good'
    else if (complianceScore >= 50) statusLevel = 'warning'
    else statusLevel = 'critical'

    return NextResponse.json({
      score: complianceScore,
      statusLevel,
      metrics: {
        totalEmployees,
        employeesWithGdprConsent: employeesWithGdprConsent.length,
        gdprConsentRate: Math.round(gdprConsentRate),
        overdueDeadlines,
        upcomingDeadlines,
        documentsExpiringSoon,
        recentAuditLogs,
        // New metrics
        safetyTrainingRate: Math.round(safetyTrainingRate),
        safetyTrainingMissing,
        safetyTrainingExpired,
        dvrRate: Math.round(dvrRate),
        dvrAcknowledgmentsPending,
        disciplinaryCodePosted: !!disciplinaryCode?.postedAt,
        activeDisciplinaryProcedures,
        pendingWhistleblowingReports,
      },
      checklist,
    })
  } catch (error) {
    console.error('Error fetching compliance status:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero dello stato compliance' },
      { status: 500 }
    )
  }
}
