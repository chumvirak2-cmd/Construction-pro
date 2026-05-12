'use client'

import React, { useEffect, useState } from 'react'
import { generateABAQRCode, getABAConfig, formatABAAmount } from '../lib/aba-payway'

interface ABAPaywayQRProps {
  orderId: string
  amount: number
  planName: string
  currency?: string
  description?: string
  onPaymentConfirmed?: (transactionId: string) => void
  className?: string
}

export default function ABAPaywayQR({
  orderId,
  amount,
  planName,
  currency = 'USD',
  description,
  onPaymentConfirmed,
  className = ''
}: ABAPaywayQRProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [useStatic, setUseStatic] = useState(false)

  const config = getABAConfig()

  useEffect(() => {
    if (!config.enabled) {
      setError('ABA Payway is not configured')
      setLoading(false)
      return
    }

    const generateQR = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to generate dynamic QR code via API
        try {
          const response = await generateABAQRCode({
            orderId,
            amount,
            currency,
            description: description || `Payment for ${planName}`,
            returnUrl: `${window.location.origin}/subscription?payment=success`
          })
          setQrCode(response.qrCode)
          setUseStatic(false)
        } catch (apiError) {
          // Fallback to static QR code if API fails
          console.warn('Dynamic QR generation failed, using static QR:', apiError)
          setQrCode(`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='white' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='12' fill='black'%3EABA QR%3C/text%3E%3Ctext x='50%25' y='60%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='10' fill='gray'%3EMerchant: ${config.merchantId?.slice(0, 8)}...%3C/text%3E%3C/svg%3E`)
          setUseStatic(true)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate QR code')
      } finally {
        setLoading(false)
      }
    }

    generateQR()
  }, [orderId, amount, currency, description, planName, config])

  const handleCopyOrderId = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(orderId)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch(() => {
          // Fallback for clipboard error
          const textarea = document.createElement('textarea')
          textarea.value = orderId
          document.body.appendChild(textarea)
          textarea.select()
          try {
            document.execCommand('copy')
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          } catch {
            alert('Unable to copy. Please copy manually: ' + orderId)
          }
          document.body.removeChild(textarea)
        })
    } else {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = orderId
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        alert('Unable to copy. Please copy manually: ' + orderId)
      }
      document.body.removeChild(textarea)
    }
  }

  const handleCopyAmount = () => {
    const amountText = amount.toString()
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(amountText)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch(() => {
          // Fallback for clipboard error
          const textarea = document.createElement('textarea')
          textarea.value = amountText
          document.body.appendChild(textarea)
          textarea.select()
          try {
            document.execCommand('copy')
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          } catch {
            alert('Unable to copy. Please copy manually: ' + amountText)
          }
          document.body.removeChild(textarea)
        })
    } else {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = amountText
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        alert('Unable to copy. Please copy manually: ' + amountText)
      }
      document.body.removeChild(textarea)
    }
  }

  if (!config.enabled) {
    return null
  }

  return (
    <div className={`aba-payway-container ${className}`}>
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '24px',
        backgroundColor: '#fafafa',
        marginTop: '24px'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
            💳 ABA Payway Transfer
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Pay using ABA (Cambodian Bank Account)
          </p>
        </div>

        {/* QR Code Section */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: '12px', color: '#6b7280', fontSize: '14px' }}>
              Generating QR code...
            </p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '12px',
            color: '#dc2626',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            ⚠️ {error}
          </div>
        ) : qrCode ? (
          <>
            {/* QR Code Image */}
            <div style={{
              textAlign: 'center',
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <img
                src={qrCode}
                alt="ABA Payway QR Code"
                style={{
                  maxWidth: '200px',
                  height: 'auto',
                  borderRadius: '4px'
                }}
              />
              <p style={{
                margin: '12px 0 0 0',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                Scan with ABA Mobile App
              </p>
            </div>

            {/* Payment Details */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '6px',
              padding: '16px',
              border: '1px solid #e5e7eb',
              marginBottom: '16px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Order ID
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '13px'
                }}>
                  <code>{orderId}</code>
                  <button
                    onClick={handleCopyOrderId}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      color: '#3b82f6',
                      fontSize: '12px'
                    }}
                  >
                    {copied ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Amount
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  <code>{formatABAAmount(amount, currency)}</code>
                  <button
                    onClick={handleCopyAmount}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      color: '#3b82f6',
                      fontSize: '12px'
                    }}
                  >
                    {copied ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Plan
                </label>
                <div style={{
                  padding: '10px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#374151'
                }}>
                  {planName}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '13px',
              color: '#1e40af',
              lineHeight: '1.6'
            }}>
              <strong>How to pay:</strong>
              <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>Open ABA Mobile App</li>
                <li>Tap QR Code Scanner</li>
                <li>Scan this QR code</li>
                <li>Review amount and confirm payment</li>
              </ol>
            </div>

            {/* Static Mode Note */}
            {useStatic && (
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '6px',
                padding: '12px',
                marginTop: '12px',
                fontSize: '12px',
                color: '#92400e'
              }}>
                ℹ️ Using static merchant QR code. Please include Order ID and Amount in transaction note.
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
