import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/disciplinary/stats - Statistiche disciplinari
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    })

    if (!user?.tenantId && !user?.employee?.tenantId) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 404 })
    }

    const tenantId = (user.tenantId || user.employee?.tenantId) as string

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')

    const where: any = { tenantId }
    if (employeeId) where.employeeId = employeeId

    // Conteggi per stato
    const byStatus = await prisma.disciplinaryProcedure.groupBy({
      by: ['status'],
      where,
      _count: true,
    })

    // Conteggi per tipo infrazione
    const byInfractionType = await prisma.disciplinaryProcedure.groupBy({
      by: ['infractionType'],
      where,
      _count: true,
    })

    // Conteggi per tipo sanzione
    const bySanctionType = await prisma.disciplinaryProcedure.groupBy({
      by: ['sanctionType'],
      where: {
        ...where,
        sanctionType: { not: null },
      },
      _count: true,
    })

    // Procedure urgenti (scadenza difese < 2 giorni)
    const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    const urgent = await prisma.disciplinaryProcedure.count({
      where: {
        ...where,
        status: 'AWAITING_DEFENSE',
        defenseDeadline: {
          lte: twoDaysFromNow,
        },
      },
    })

    // Dipendenti con recidiva (2+ procedure in 2 anni)
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

    const recidivists = await prisma.disciplinaryProcedure.groupBy({
      by: ['employeeId'],
      where: {
        ...where,
        infractionDate: { gte: twoYearsAgo },
        status: { in: ['SANCTION_ISSUED', 'CLOSED'] },
      },
      _count: true,
      having: {
        employeeId: {
          _count: { gt: 1 },
        },
      },
    })

    return NextResponse.json({
      byStatus,
      byInfractionType,
      bySanctionType,
      urgent,
      recidivistsCount: recidivists.length,
    })
  } catch (error) {
    console.error('Error fetching disciplinary stats:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento delle statistiche' },
      { status: 500 }
    )
  }
}
