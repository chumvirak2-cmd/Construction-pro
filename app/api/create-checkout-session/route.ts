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

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
  professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise'
}

export async function POST(request: NextRequest) {
  const stripeInstance = getStripe()
  if (!stripeInstance) {
    return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 })
  }
  
  try {
    const { planId, userId, email } = await request.json()
    
    if (!planId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const priceId = PRICE_IDS[planId]
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    
    const domain = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const checkoutSession = await stripeInstance.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
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
        planId
      }
    })
    
    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout session error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}