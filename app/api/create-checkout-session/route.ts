import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

let stripe: Stripe | null = null
function getStripe() {
  if (!stripe && stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey)
  }
  return stripe
}

const PRICE_IDS: Record<string, { monthly: string; yearly: string }> = {
  starter: {
    monthly: process.env.STRIPE_STARTER_MONTHLY_ID || 'price_basic_monthly',
    yearly: process.env.STRIPE_STARTER_YEARLY_ID || 'price_basic_yearly'
  },
  professional: {
    monthly: process.env.STRIPE_PRO_MONTHLY_ID || 'price_pro_monthly',
    yearly: process.env.STRIPE_PRO_YEARLY_ID || 'price_pro_yearly'
  },
  enterprise: {
    monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_ID || 'price_enterprise_monthly',
    yearly: process.env.STRIPE_ENTERPRISE_YEARLY_ID || 'price_enterprise_yearly'
  }
}

export async function POST(request: NextRequest) {
  const stripeInstance = getStripe()
  if (!stripeInstance) {
    return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 })
  }
  
  try {
    const { planId, userId, billingCycle = 'month' } = await request.json()
    
    if (!planId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const priceConfig = PRICE_IDS[planId]
    if (!priceConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    
    const priceId = billingCycle === 'year' ? priceConfig.yearly : priceConfig.monthly
    const domain = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const checkoutSession = await stripeInstance.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'paypal'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${domain}/subscription?success=true&plan=${planId}`,
      cancel_url: `${domain}/subscription?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId,
        planId,
        billingCycle
      }
    })
    
    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout session error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}