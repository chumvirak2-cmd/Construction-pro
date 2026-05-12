/**
 * ABA Payway Integration Service
 * Handles ABA Payway QR code generation and payment tracking
 */

interface ABAPaywayConfig {
  merchantId: string
  apiKey: string
  serviceCode: string
  enabled: boolean
}

interface ABAPaymentRequest {
  orderId: string
  amount: number
  currency?: string
  description?: string
  returnUrl?: string
}

interface ABAQRCodeResponse {
  qrCode: string
  transactionId?: string
  validUntil?: string
}

// Get ABA config from environment variables
export function getABAConfig(): ABAPaywayConfig {
  return {
    merchantId: process.env.NEXT_PUBLIC_ABA_MERCHANT_ID || '',
    apiKey: process.env.ABA_PAYWAY_API_KEY || '',
    serviceCode: process.env.NEXT_PUBLIC_ABA_SERVICE_CODE || '',
    enabled: Boolean(process.env.NEXT_PUBLIC_ABA_MERCHANT_ID)
  }
}

/**
 * Generate ABA Payway QR code for a payment
 * @param request Payment request details
 * @returns QR code data URL or base64 string
 */
export async function generateABAQRCode(request: ABAPaymentRequest): Promise<ABAQRCodeResponse> {
  const config = getABAConfig()
  
  if (!config.enabled) {
    throw new Error('ABA Payway is not configured. Please set NEXT_PUBLIC_ABA_MERCHANT_ID environment variable.')
  }

  try {
    // Use ABA Payway API to generate QR code
    // This is a placeholder - replace with actual ABA API endpoint
    const response = await fetch('https://api.payway.com.kh/api/v1/qr-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        merchantId: config.merchantId,
        serviceCode: config.serviceCode,
        orderId: request.orderId,
        amount: request.amount,
        currency: request.currency || 'USD',
        description: request.description,
        returnUrl: request.returnUrl,
      })
    })

    if (!response.ok) {
      throw new Error(`ABA Payway API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      qrCode: data.qrCode,
      transactionId: data.transactionId,
      validUntil: data.validUntil
    }
  } catch (error) {
    console.error('Failed to generate ABA QR code:', error)
    throw new Error('Could not generate ABA Payway QR code')
  }
}

/**
 * Create a static QR code URL for ABA merchant account
 * Useful for manual payments without API integration
 * @param amount Amount to pay
 * @param orderId Order/Invoice ID
 * @returns QR code data URL
 */
export async function generateStaticABAQRCode(amount: number, orderId: string): Promise<string> {
  const config = getABAConfig()
  
  if (!config.merchantId) {
    throw new Error('ABA Merchant ID not configured')
  }

  // This would typically call a QR code generation service
  // For now, return a placeholder that can be replaced with actual ABA merchant account QR
  const qrData = `ABA|${config.merchantId}|${amount}|${orderId}`
  
  // In production, use a library like 'qrcode' to generate actual QR code
  // Example: const qr = await QRCode.toDataURL(qrData)
  
  return qrData
}

/**
 * Verify ABA payment webhook from Payway
 * @param payload Webhook payload from ABA
 * @param signature HMAC signature
 * @returns true if signature is valid
 */
export function verifyABAWebhook(payload: any, signature: string): boolean {
  const config = getABAConfig()
  
  if (!config.apiKey) {
    return false
  }

  // In production, implement HMAC-SHA256 verification
  // Example implementation:
  // const crypto = require('crypto');
  // const hash = crypto.createHmac('sha256', config.apiKey).update(JSON.stringify(payload)).digest('hex');
  // return hash === signature;
  
  return true // Placeholder
}

/**
 * Get payment status from ABA Payway
 * @param transactionId Transaction ID from QR code generation
 * @returns Payment status and details
 */
export async function getABAPaymentStatus(transactionId: string): Promise<any> {
  const config = getABAConfig()
  
  if (!config.enabled) {
    throw new Error('ABA Payway is not configured')
  }

  try {
    const response = await fetch(`https://api.payway.com.kh/api/v1/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch payment status: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to get ABA payment status:', error)
    throw error
  }
}

/**
 * Format amount for ABA display
 * @param amount Amount in USD or specified currency
 * @returns Formatted string
 */
export function formatABAAmount(amount: number, currency: string = 'USD'): string {
  return `${currency} ${amount.toFixed(2)}`
}
