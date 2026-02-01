import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { id } = await params

    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            userId: true,
          },
        },
      },
    })

    if (!payslip) {
      return NextResponse.json({ error: 'Cedolino non trovato' }, { status: 404 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    // Check authorization
    if (user?.tenantId !== payslip.tenantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Send notification if employee has user account
    if (payslip.employee.userId) {
      const [year, month] = payslip.period.split('-')
      const monthNames = [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
      ]

      await prisma.notification.create({
        data: {
          tenantId: payslip.tenantId,
          userId: payslip.employee.userId,
          type: 'PAYSLIP_AVAILABLE',
          title: 'Nuova busta paga disponibile',
          message: `La tua busta paga di ${monthNames[parseInt(month) - 1]} ${year} è ora disponibile per il download`,
          link: `/payslips/${payslip.id}`,
          entityType: 'Payslip',
          entityId: payslip.id,
          emailSent: false,
        },
      })

      // TODO: Send email notification here
      // await sendEmail({
      //   to: payslip.employee.email,
      //   subject: 'Nuova busta paga disponibile',
      //   template: 'payslip-notification',
      //   data: { payslip, employee: payslip.employee }
      // })

      return NextResponse.json({
        message: 'Notifica inviata con successo',
        notified: true,
      })
    } else {
      return NextResponse.json({
        message: 'Dipendente senza account utente',
        notified: false,
        warning: 'Il dipendente non ha un account utente attivo. Invia il cedolino manualmente via email.',
      })
    }
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
