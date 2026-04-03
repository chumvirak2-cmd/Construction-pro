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

export async function POST(request: NextRequest) {
  const stripeInstance = getStripe()
  if (!stripeInstance) {
    return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 })
  }
  
  try {
    const { customerId } = await request.json()
    
    if (!customerId) {
      return NextResponse.json({ error: 'Missing customer ID' }, { status: 400 })
    }
    
    const domain = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const portalSession = await stripeInstance.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${domain}/subscription`
    })
    
    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Portal session error:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}