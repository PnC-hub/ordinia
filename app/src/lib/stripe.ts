import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export const PLANS = {
  STARTER: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    price: 2900, // €29.00
    maxEmployees: 5,
    features: ['Portale dipendenti', 'Gestione documenti', 'Tracking scadenze', 'Template CCNL', 'Supporto email']
  },
  PROFESSIONAL: {
    name: 'Professional',
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || '',
    price: 5900, // €59.00
    maxEmployees: 15,
    features: ['Tutto di Starter', 'Valutazione performance', 'Onboarding automatico', 'Gestione disciplinare', 'Privacy GDPR completa', 'Notifiche automatiche', 'Supporto prioritario']
  },
  ENTERPRISE: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    price: 9900, // €99.00
    maxEmployees: Infinity,
    features: ['Tutto di Professional', 'Multi-sede', 'API integrations', 'Report personalizzati', 'Account manager dedicato', 'Formazione inclusa', 'SLA garantito']
  },
  PARTNER: {
    name: 'Partner White-label',
    priceId: process.env.STRIPE_PARTNER_PRICE_ID || '',
    price: 19900, // €199.00
    maxEmployees: Infinity,
    features: ['Tutto di Enterprise', 'White-label completo', 'Gestione multi-cliente', 'Margine rivenditore', 'Dashboard partner', 'Formazione rivenditori']
  }
}

export async function createCustomer(email: string, name: string) {
  return stripe.customers.create({
    email,
    name,
    metadata: { source: 'geniushr_saas' }
  })
}

export async function createCheckoutSession({
  customerId,
  priceId,
  tenantId,
  successUrl,
  cancelUrl
}: {
  customerId: string
  priceId: string
  tenantId: string
  successUrl: string
  cancelUrl: string
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { tenantId },
    subscription_data: {
      metadata: { tenantId }
    }
  })
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  })
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId)
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId)
}
