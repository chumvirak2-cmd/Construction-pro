'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { SUBSCRIPTION_PLANS, subscriptionDb, authDb } from '../lib/db'
import { User, Subscription } from '../types'
import Link from 'next/link'

export default function SubscriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const user = authDb.getCurrentUser()
    setCurrentUser(user)
    if (user) {
      const sub = subscriptionDb.getByUserId(user.id)
      setCurrentSubscription(sub || null)
    }
  }, [])

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: currentUser?.id })
      })
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        alert(data.error + '\n\nFor demo/testing, click "Try Demo Mode" below.')
      } else {
        alert('Unable to create checkout session. Please try again.')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const handleDemoMode = () => {
    if (currentUser) {
      subscriptionDb.create({
        userId: currentUser.id,
        tier: 'professional',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false
      })
      router.push('/dashboard')
    }
  }

  const handleManageSubscription = async () => {
    if (!currentSubscription?.stripeCustomerId) return
    
    setLoading('manage')
    
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: currentSubscription.stripeCustomerId })
      })
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Unable to access billing portal.')
      }
    } catch (error) {
      console.error('Portal error:', error)
    } finally {
      setLoading(null)
    }
  }

  const currentPlan = currentSubscription ? SUBSCRIPTION_PLANS.find(p => p.id === currentSubscription.tier) : null
  const effectiveStatus = currentSubscription?.status === 'active' || currentSubscription?.status === 'trialing' 
    ? 'active' 
    : currentSubscription?.status || 'none'

  if (!isClient) {
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '24px 12px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <img src="/logo.png" alt="ConstructionPro" style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '12px' }} />
          </Link>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px', color: '#111827' }}>Choose Your Plan</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Select the plan that best fits your construction management needs
          </p>
          {effectiveStatus !== 'none' && (
            <div style={{ marginTop: '16px', padding: '8px 16px', background: effectiveStatus === 'active' ? '#d1fae5' : '#fee2e2', borderRadius: '6px', display: 'inline-block' }}>
              <span style={{ color: effectiveStatus === 'active' ? '#065f46' : '#991b1b', fontSize: '13px', fontWeight: 500 }}>
                Current Plan: {currentPlan?.name || 'Unknown'} ({effectiveStatus})
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrentPlan = currentSubscription?.tier === plan.id
            const isPopular = plan.id === 'professional'
            
            return (
              <div
                key={plan.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: isPopular ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
                  border: isPopular ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  position: 'relative'
                }}
              >
                {isPopular && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                    Most Popular
                  </div>
                )}
                
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px', color: '#111827' }}>{plan.name}</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827' }}>${plan.price}</span>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>/{plan.interval}</span>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                    {plan.limits.maxProjects === -1 ? 'Unlimited' : plan.limits.maxProjects} Projects
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                    {plan.limits.maxWorkers === -1 ? 'Unlimited' : plan.limits.maxWorkers} Workers
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                    {plan.limits.maxInventoryItems === -1 ? 'Unlimited' : plan.limits.maxInventoryItems} Inventory Items
                  </div>
                </div>

                <ul style={{ padding: 0, margin: '0 0 24px', listStyle: 'none' }}>
                  {plan.limits.features.map((feature) => (
                    <li key={feature} style={{ fontSize: '13px', color: '#374151', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: '#10b981', marginRight: '8px' }}>✓</span>
                      {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan && effectiveStatus === 'active' ? (
                  <button
                    disabled
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, border: 'none', background: '#e5e7eb', color: '#6b7280', cursor: 'not-allowed' }}
                  >
                    Current Plan
                  </button>
                ) : effectiveStatus !== 'none' && !isCurrentPlan ? (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!loading}
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, border: 'none', background: '#3b82f6', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading === plan.id ? 'Processing...' : `Upgrade to ${plan.name}`}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!loading}
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, border: 'none', background: isPopular ? '#3b82f6' : '#111827', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading === plan.id ? 'Processing...' : `Subscribe to ${plan.name}`}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {effectiveStatus !== 'none' && currentSubscription && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={handleManageSubscription}
              disabled={!!loading}
              style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer', textDecoration: 'underline' }}
            >
              {loading === 'manage' ? 'Loading...' : 'Manage billing & subscription'}
            </button>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
              {currentSubscription.status === 'canceled' && (
                <span>Your subscription will end on {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '32px', padding: '16px', background: 'white', borderRadius: '8px', maxWidth: '600px', margin: '32px auto 0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px' }}>Need a custom solution?</h3>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px' }}>Contact us for enterprise pricing with custom integrations and dedicated support.</p>
          <a href="mailto:enterprise@constructionpro.app" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none' }}>enterprise@constructionpro.app</a>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: '#9ca3af' }}>
          <p style={{ margin: '0 0 4px' }}>Secure payments powered by Stripe. Cancel anytime.</p>
          <p style={{ margin: 0 }}>&copy; 2026 BEE-TRUST ENGINEERING. All rights reserved.</p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={handleDemoMode}
            style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}
          >
            Try Demo Mode (Free)
          </button>
          <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
            Test all features without payment
          </p>
        </div>
      </div>
    </div>
  )
}