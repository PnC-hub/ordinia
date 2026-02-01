import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/consultant/[clientId]/messages
 *
 * Returns messages for this client
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

    // Get notifications sent by consultant to this tenant
    const messages = await prisma.notification.findMany({
      where: {
        tenantId: clientId,
        // In a real system, you'd have a separate Message model
        // For now, using notifications as proxy
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    // Transform to message format
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      type: msg.type.includes('DOCUMENT') ? 'request' : 'general',
      subject: msg.title,
      content: msg.message,
      employeeId: msg.entityId,
      employeeName: null, // Would need to join with employee
      sentAt: msg.createdAt.toISOString(),
      status: msg.isRead ? 'read' : 'sent',
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/consultant/[clientId]/messages
 *
 * Send a new message to client
 */
export async function POST(
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

    const body = await req.json()
    const { type, employeeId, subject, content } = body

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get tenant owners/admins to notify
    const tenantMembers = await prisma.tenantMember.findMany({
      where: {
        tenantId: clientId,
        role: { in: ['OWNER', 'ADMIN', 'HR_MANAGER'] },
      },
      include: {
        user: true,
      },
    })

    // Create notification for each admin
    for (const member of tenantMembers) {
      await prisma.notification.create({
        data: {
          userId: member.userId,
          tenantId: clientId,
          type: type === 'request' ? 'DOCUMENT_TO_SIGN' : 'SYSTEM_ALERT',
          title: subject,
          message: content,
          entityType: employeeId ? 'Employee' : null,
          entityId: employeeId || null,
        },
      })
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        tenantId: clientId,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'Message',
        entityId: employeeId || 'general',
        details: {
          type,
          subject,
          from: 'consultant',
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
