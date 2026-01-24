import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCustomer, createCheckoutSession, PLANS } from '@/lib/stripe'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      studioName,
      email,
      password,
      ownerName,
      plan = 'STARTER'
    } = body

    // Validate input
    if (!studioName || !email || !password || !ownerName) {
      return NextResponse.json(
        { error: 'Tutti i campi sono obbligatori' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email gia registrata' },
        { status: 400 }
      )
    }

    // Generate slug from studio name
    const slug = studioName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check if slug already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug }
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Nome studio gia in uso, scegline un altro' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create Stripe customer
    const stripeCustomer = await createCustomer(email, ownerName)

    // Create user and tenant
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name: ownerName,
          password: hashedPassword,
          role: 'ADMIN'
        }
      })

      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: studioName,
          slug,
          plan: plan as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'PARTNER',
          stripeCustomerId: stripeCustomer.id,
          subscriptionStatus: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          members: {
            create: {
              userId: user.id,
              role: 'OWNER'
            }
          }
        }
      })

      return { user, tenant }
    })

    // Create Stripe checkout session for subscription
    const planConfig = PLANS[plan as keyof typeof PLANS]

    if (planConfig.priceId) {
      const checkoutSession = await createCheckoutSession({
        customerId: stripeCustomer.id,
        priceId: planConfig.priceId,
        tenantId: result.tenant.id,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/register?canceled=true`
      })

      return NextResponse.json({
        success: true,
        tenant: result.tenant,
        checkoutUrl: checkoutSession.url
      })
    }

    // If no price ID configured (dev mode), just return success
    return NextResponse.json({
      success: true,
      tenant: result.tenant,
      portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${result.tenant.slug}`
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Errore durante la registrazione' },
      { status: 500 }
    )
  }
}
