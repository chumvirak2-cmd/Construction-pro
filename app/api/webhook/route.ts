import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

let stripe: Stripe | null = null
function getStripe() {
  if (!stripe && stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey)
  }
  return stripe
}

export async function POST(request: NextRequest) {
  const stripeInstance = getStripe()
  if (!stripeInstance) {
    return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 })
  }
  
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripeInstance.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const stripeInstance = getStripe()
  if (!stripeInstance) return
  
  const userId = session.client_reference_id
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  
  if (!userId) return

  const subscription = await stripeInstance.subscriptions.retrieve(subscriptionId)
  
  const periodStart = new Date(subscription.current_period_start * 1000).toISOString()
  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString()
  
  const tier = getTierFromPriceId(subscription.items.data[0]?.price.id || '')
  
  const { subscriptionDb } = await import('../../lib/db')
  
  const existingSub = subscriptionDb.getByUserId(userId)
  
  if (existingSub) {
    subscriptionDb.update(existingSub.id, {
      tier,
      status: 'active',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId
    })
  } else {
    subscriptionDb.create({
      userId,
      tier,
      status: 'active',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId
    })
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const { subscriptionDb } = await import('../../lib/db')
  
  const subs = subscriptionDb.getAll()
  const existingSub = subs.find(s => s.stripeSubscriptionId === subscription.id)
  
  if (!existingSub) return
  
  const statusMap: Record<Stripe.Subscription.Status, string> = {
    'active': 'active',
    'trialing': 'trialing',
    'past_due': 'past_due',
    'canceled': 'canceled',
    'unpaid': 'unpaid',
    'incomplete': 'unpaid',
    'incomplete_expired': 'canceled',
    'paused': 'active'
  }
  
  const periodStart = new Date(subscription.current_period_start * 1000).toISOString()
  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString()
  const mappedStatus = statusMap[subscription.status] || 'active'
  
  subscriptionDb.update(existingSub.id, {
    status: mappedStatus as 'active' | 'past_due' | 'canceled' | 'trialing' | 'unpaid',
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { subscriptionDb } = await import('../../lib/db')
  
  const subs = subscriptionDb.getAll()
  const existingSub = subs.find(s => s.stripeSubscriptionId === subscription.id)
  
  if (!existingSub) return
  
  subscriptionDb.update(existingSub.id, {
    status: 'canceled',
    tier: 'starter'
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const { subscriptionDb } = await import('../../lib/db')
  
  const customerId = invoice.customer as string
  
  const subs = subscriptionDb.getAll()
  const existingSub = subs.find(s => s.stripeCustomerId === customerId)
  
  if (!existingSub) return
  
  subscriptionDb.update(existingSub.id, {
    status: 'past_due'
  })
}

function getTierFromPriceId(priceId: string): 'starter' | 'professional' | 'enterprise' {
  if (priceId.includes('enterprise')) return 'enterprise'
  if (priceId.includes('professional')) return 'professional'
  return 'starter'
}