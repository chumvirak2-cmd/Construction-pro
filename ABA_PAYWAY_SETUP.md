# ABA Payway Integration Setup Guide

## Overview

ABA Payway is integrated into your Construction Pro subscription page, allowing customers to pay using ABA bank transfers with QR codes. This payment method works alongside Stripe.

## Setup Steps

### 1. Get ABA Payway Merchant Credentials

You need to register as a merchant with ABA Payway:

1. Visit [ABA Payway Merchant Portal](https://payway.ababank.com/merchant)
2. Register your business account
3. Complete KYC (Know Your Customer) verification
4. Once approved, you'll receive:
   - **Merchant ID** (e.g., `MERCHANT_ABC123`)
   - **API Key** (secret key for backend authentication)
   - **Service Code** (specific to your payment service)

### 2. Configure Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# ABA Payway Configuration
NEXT_PUBLIC_ABA_MERCHANT_ID=your_merchant_id_here
NEXT_PUBLIC_ABA_SERVICE_CODE=your_service_code_here
ABA_PAYWAY_API_KEY=your_api_key_here
```

**Important:** 
- `NEXT_PUBLIC_` variables are exposed to the client (use for IDs that are safe to share)
- `ABA_PAYWAY_API_KEY` is server-only (keep it secret)

### 3. Update `.gitignore`

Make sure your `.env.local` file is in `.gitignore`:

```gitignore
.env.local
.env.*.local
```

### 4. Test the Integration

1. Start your dev server: `npm run dev`
2. Navigate to the subscription page
3. Click on any subscription plan
4. Select "ABA Payway" as the payment method
5. Verify that the QR code displays correctly

## Features

### Dynamic QR Code Generation
- When a customer selects a plan and chooses ABA payment, a dynamic QR code is generated
- QR codes are valid for 24 hours
- Order ID and amount are included in the code

### Static Fallback
- If API connectivity fails, the system falls back to a static merchant QR code
- Customers must manually enter Order ID and Amount in the transaction note

### Payment Tracking
- Order IDs are generated with user ID and timestamp: `ORDER-{userId}-{timestamp}`
- ABA transaction IDs are tracked for reconciliation
- Payment status can be verified via webhook

## Webhook Handling

### Setting Up Webhooks

1. In your ABA Merchant Portal, go to **Webhooks**
2. Add a webhook endpoint:
   - URL: `https://yourapp.com/api/webhook/aba`
   - Events: `payment.completed`, `payment.failed`
   - Secret: Generate and save securely

### Processing Webhooks

Add webhook handling in `app/api/webhook/aba/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyABAWebhook } from '@/app/lib/aba-payway'
import { subscriptionDb } from '@/app/lib/db'

export async function POST(req: NextRequest) {
  const payload = await req.json()
  const signature = req.headers.get('x-aba-signature') || ''

  // Verify webhook signature
  if (!verifyABAWebhook(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Handle payment completion
  if (payload.event === 'payment.completed') {
    const { orderId, amount, transactionId } = payload

    // Parse order ID to get user ID
    const userId = orderId.split('-')[1]

    // Update subscription in database
    const user = authDb.getUserById(userId)
    if (user) {
      subscriptionDb.create({
        userId: user.id,
        tier: payload.planTier,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false
      })

      // Log transaction
      console.log(`ABA Payment received: ${transactionId} for order ${orderId}`)
    }
  }

  return NextResponse.json({ received: true })
}
```

## Testing

### Test Merchant Credentials

ABA provides test credentials for development:

1. Contact ABA support for test merchant ID
2. Use these in development environment
3. Test QR code generation without making actual payments

### Manual Testing

Use the Construction Pro demo mode to test:
1. Click "Try Demo Mode" button
2. Navigate to dashboard
3. Create a subscription change scenario
4. Verify ABA payment flow

## Troubleshooting

### QR Code Not Displaying

- **Check 1:** Verify `NEXT_PUBLIC_ABA_MERCHANT_ID` is set correctly
- **Check 2:** Verify API key is correct in `ABA_PAYWAY_API_KEY`
- **Check 3:** Check browser console for errors
- **Check 4:** Verify network request to ABA API

### Payment Not Confirmed

- Check webhook endpoint in ABA portal
- Verify webhook signature secret matches
- Check server logs for webhook processing errors
- Verify subscription database is being updated

### "ABA Payway is not configured" Error

- Verify environment variables are set
- Ensure `.env.local` file exists
- Restart dev server after updating env variables
- Check that variable names match exactly

## Security Considerations

1. **API Key Protection:**
   - Never commit API keys to git
   - Use `.env.local` for local development
   - Use environment secrets on production (Vercel, etc.)

2. **Webhook Verification:**
   - Always verify webhook signatures
   - Implement rate limiting on webhook endpoint
   - Log all webhook events

3. **Payment Verification:**
   - Don't trust client-side payment confirmations
   - Always verify with ABA backend
   - Store transaction IDs for reconciliation

4. **Data Storage:**
   - Don't store full card details
   - Use ABA's transaction ID for reference
   - Encrypt sensitive data at rest

## Rate Limits

ABA Payway has the following rate limits:
- QR Code Generation: 100 requests/minute
- Payment Status: 1000 requests/minute
- Webhook delivery: 30 second timeout

## Support

For ABA Payway support:
- Email: `support@payway.ababank.com`
- Phone: `+855-23-888-888`
- Portal: https://payway.ababank.com/support

## Useful Links

- [ABA Payway Docs](https://payway.ababank.com/api/docs)
- [Merchant Portal](https://payway.ababank.com/merchant)
- [QR Code Specifications](https://payway.ababank.com/docs/qr-code)
- [Webhook Reference](https://payway.ababank.com/docs/webhooks)

---

**Last Updated:** May 2026
**Status:** Production Ready
