import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/consultant/[clientId]/attendance/exports
 *
 * Returns export history for this client
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clientId } = await params

    // Verify consultant has access to this client
    const access = await prisma.consultantClient.findFirst({
      where: {
        consultantId: session.user.id,
        tenantId: clientId,
        isActive: true,
      },
    })

    if (!access) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get audit logs for exports
    const exports = await prisma.auditLog.findMany({
      where: {
        tenantId: clientId,
        userId: session.user.id,
        action: 'EXPORT',
        entityType: 'TimeEntry',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    const history = exports.map((exp) => ({
      period: (exp.details as any)?.period || 'N/A',
      format: (exp.details as any)?.format || 'csv',
      exportedAt: exp.createdAt.toISOString(),
    }))

    return NextResponse.json(history)
  } catch (error) {
    console.error('Error fetching export history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
