import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Get consultant's clients
    const consultantClients = await prisma.consultantClient.findMany({
      where: { consultantId: session.user.id },
      include: {
        tenant: {
          include: {
            _count: {
              select: {
                employees: true,
              },
            },
          },
        },
      },
    })

    // Get stats for each client
    const clientsWithStats = await Promise.all(
      consultantClients.map(async (cc) => {
        // Get compliance status
        const complianceRes = await prisma.$queryRaw<{ score: number }[]>`
          SELECT
            COALESCE(
              (
                (SELECT COUNT(*) FROM "GdprConsent" WHERE "tenantId" = ${cc.tenantId} AND "granted" = true) * 100.0 /
                NULLIF((SELECT COUNT(*) FROM "Employee" WHERE "tenantId" = ${cc.tenantId}), 0)
              ),
              100
            ) as score
        `
        const complianceScore = Math.round(complianceRes[0]?.score || 100)

        // Get pending signatures count
        const pendingSignatures = await prisma.documentSignatureRequest.count({
          where: {
            document: { tenantId: cc.tenantId },
            status: 'PENDING',
          },
        })

        // Get overdue deadlines
        const overdueDeadlines = await prisma.deadline.count({
          where: {
            tenantId: cc.tenantId,
            dueDate: { lt: new Date() },
            completedAt: null,
          },
        })

        // Get last activity
        const lastAuditLog = await prisma.auditLog.findFirst({
          where: { tenantId: cc.tenantId },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        })

        return {
          id: cc.tenantId,
          name: cc.tenant.name,
          employeeCount: cc.tenant._count.employees,
          pendingTasks: pendingSignatures + overdueDeadlines,
          complianceScore,
          lastActivity: lastAuditLog?.createdAt?.toISOString() || null,
        }
      })
    )

    // Calculate totals
    const stats = {
      totalClients: consultantClients.length,
      totalEmployees: clientsWithStats.reduce((sum, c) => sum + c.employeeCount, 0),
      pendingSignatures: clientsWithStats.reduce((sum, c) => sum + c.pendingTasks, 0),
      overdueDeadlines: 0,
      upcomingDeadlines: 0,
    }

    // Get upcoming deadlines (next 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    for (const cc of consultantClients) {
      const upcoming = await prisma.deadline.count({
        where: {
          tenantId: cc.tenantId,
          dueDate: {
            gte: new Date(),
            lte: thirtyDaysFromNow,
          },
          completedAt: null,
        },
      })
      stats.upcomingDeadlines += upcoming

      const overdue = await prisma.deadline.count({
        where: {
          tenantId: cc.tenantId,
          dueDate: { lt: new Date() },
          completedAt: null,
        },
      })
      stats.overdueDeadlines += overdue
    }

    return NextResponse.json({
      clients: clientsWithStats,
      stats,
    })
  } catch (error) {
    console.error('Error fetching consultant dashboard:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
