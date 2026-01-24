import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/whistleblowing/check - Check report status by access code (public endpoint)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { accessCode } = body

    if (!accessCode) {
      return NextResponse.json(
        { error: 'Codice di accesso obbligatorio' },
        { status: 400 }
      )
    }

    const report = await prisma.whistleblowingReport.findUnique({
      where: { accessCode: accessCode.toUpperCase() },
      select: {
        id: true,
        reportDate: true,
        category: true,
        title: true,
        status: true,
        acknowledgedAt: true,
        investigationStartedAt: true,
        closedAt: true,
        outcome: true,
        lastFeedbackAt: true,
        messages: {
          where: { senderType: 'manager' },
          select: {
            content: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Segnalazione non trovata. Verifica il codice di accesso.' },
        { status: 404 }
      )
    }

    // Status labels in Italian
    const statusLabels: Record<string, string> = {
      RECEIVED: 'Ricevuta',
      ACKNOWLEDGED: 'Presa in carico',
      UNDER_INVESTIGATION: 'In indagine',
      ADDITIONAL_INFO_REQUESTED: 'Richieste informazioni aggiuntive',
      SUBSTANTIATED: 'Fondata',
      UNSUBSTANTIATED: 'Non fondata',
      CLOSED: 'Chiusa',
    }

    return NextResponse.json({
      ...report,
      statusLabel: statusLabels[report.status] || report.status,
    })
  } catch (error) {
    console.error('Error checking whistleblowing report:', error)
    return NextResponse.json(
      { error: 'Errore nella verifica segnalazione' },
      { status: 500 }
    )
  }
}
