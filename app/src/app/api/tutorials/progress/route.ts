import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tutorials/progress - Get all tutorial progress for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenantMembers: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    }

    const tenantId = user.tenantMembers[0]?.tenantId || user.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 404 })
    }

    const searchParams = request.nextUrl.searchParams
    const tutorialId = searchParams.get('tutorialId')

    if (tutorialId) {
      // Get progress for specific tutorial
      const progress = await prisma.tutorialProgress.findUnique({
        where: {
          userId_tutorialId_tenantId: {
            userId: user.id,
            tutorialId,
            tenantId,
          },
        },
      })

      return NextResponse.json(progress)
    }

    // Get all progress
    const allProgress = await prisma.tutorialProgress.findMany({
      where: {
        userId: user.id,
        tenantId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json(allProgress)
  } catch (error) {
    console.error('Error fetching tutorial progress:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento progresso tutorial' },
      { status: 500 }
    )
  }
}

// POST /api/tutorials/progress - Update tutorial progress
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenantMembers: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    }

    const tenantId = user.tenantMembers[0]?.tenantId || user.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 404 })
    }

    const body = await request.json()
    const {
      tutorialId,
      currentSection,
      totalSections,
      status,
      timeSpent,
    }: {
      tutorialId: string
      currentSection: number
      totalSections: number
      status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
      timeSpent?: number
    } = body

    if (!tutorialId || currentSection === undefined || !totalSections) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    // Calculate progress
    const completedSections = currentSection + 1
    const progressPercent = Math.round((completedSections / totalSections) * 100)

    // Determine status
    let finalStatus = status
    if (!finalStatus) {
      if (progressPercent === 0) {
        finalStatus = 'NOT_STARTED'
      } else if (progressPercent === 100) {
        finalStatus = 'COMPLETED'
      } else {
        finalStatus = 'IN_PROGRESS'
      }
    }

    // Upsert progress
    const progress = await prisma.tutorialProgress.upsert({
      where: {
        userId_tutorialId_tenantId: {
          userId: user.id,
          tutorialId,
          tenantId,
        },
      },
      update: {
        currentSection,
        totalSections,
        completedSections,
        progressPercent,
        status: finalStatus,
        lastViewedAt: new Date(),
        timeSpent: timeSpent
          ? {
              increment: timeSpent,
            }
          : undefined,
        viewCount: {
          increment: 1,
        },
        ...(finalStatus === 'COMPLETED' && { completedAt: new Date() }),
      },
      create: {
        userId: user.id,
        tutorialId,
        tenantId,
        currentSection,
        totalSections,
        completedSections,
        progressPercent,
        status: finalStatus,
        startedAt: finalStatus !== 'NOT_STARTED' ? new Date() : undefined,
        lastViewedAt: new Date(),
        timeSpent: timeSpent || 0,
        viewCount: 1,
        ...(finalStatus === 'COMPLETED' && { completedAt: new Date() }),
      },
    })

    // Update analytics
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    await prisma.tutorialAnalytics.upsert({
      where: {
        tenantId_tutorialId_year_month: {
          tenantId,
          tutorialId,
          year,
          month,
        },
      },
      update: {
        views: {
          increment: 1,
        },
        ...(finalStatus === 'COMPLETED' && {
          completions: {
            increment: 1,
          },
        }),
      },
      create: {
        tenantId,
        tutorialId,
        year,
        month,
        views: 1,
        completions: finalStatus === 'COMPLETED' ? 1 : 0,
        avgTimeSpent: timeSpent || 0,
        uniqueUsers: 1,
      },
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error updating tutorial progress:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento progresso' },
      { status: 500 }
    )
  }
}
