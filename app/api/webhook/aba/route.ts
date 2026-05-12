import { NextRequest, NextResponse } from 'next/server'
import { verifyABAWebhook } from '@/app/lib/aba-payway'
import { subscriptionDb } from '@/app/lib/db'
import { authDb } from '@/app/lib/db'

export async function POST(req: NextRequest) {
  const payload = await req.json()
  const signature = req.headers.get('x-aba-signature') || ''

  // Verify webhook signature
  if (!verifyABAWebhook(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Handle payment completion
  if (payload.event === 'payment.completed') {
    const { orderId, amount, transactionId, planTier } = payload

    // Parse order ID to get user ID
    const userId = orderId.split('-')[1]

    // Get user to confirm they exist
    const user = authDb.getUserById(userId)
    if (user) {
      // Update subscription in database
      subscriptionDb.create({
        userId: user.id,
        tier: planTier,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        abaTransactionId: transactionId
      })

      // Log transaction
      console.log(`ABA Payment received: ${transactionId} for order ${orderId}`)
    }
  }

  // Handle payment failed
  if (payload.event === 'payment.failed') {
    const { orderId } = payload
    const userId = orderId.split('-')[1]
    
    console.log(`ABA Payment failed for order ${orderId}`)
    // Optionally notify user or update subscription status
  }

  return NextResponse.json({ received: true })
}