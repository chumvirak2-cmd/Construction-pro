'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { User, Subscription } from '../../types'
import { authDb, subscriptionDb, demoDb, SUBSCRIPTION_PLANS } from '../../lib/db'
import ABAPaywayQR from '../../components/ABAPaywayQR'
import { getABAConfig } from '../../lib/aba-payway'

export default function SubscriptionPage() {
  const router = useRouter()
  const locale = useLocale()
  const [loading, setLoading] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'aba'>('stripe')
  const abaConfig = getABAConfig()
  const orderIdBase = currentUser && selectedPlan ? `ORDER-${currentUser.id}` : ''

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
        body: JSON.stringify({ planId, userId: currentUser?.id, billingCycle })
      })
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        const paymentError = typeof data.error === 'string' ? data.error : 'Unable to create checkout session.'
        const isProviderIssue = /provider_unavailable|provider returned error|temporarily unavailable|502|503/i.test(paymentError)

        alert(
          isProviderIssue
            ? 'Stripe checkout is temporarily unavailable. Please try again shortly or choose ABA Payway if available.'
            : `${paymentError}\n\nFor demo/testing, click "Try Demo Mode" below.`
        )
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
    demoDb.enableDemoMode()
    localStorage.setItem('loggedIn', 'true')

    if (currentUser) {
      subscriptionDb.create({
        userId: currentUser.id,
        tier: 'starter',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false
      })
    }

    router.push(`/${locale}/dashboard`)
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12 animate-fade-up">
          <Link href={`/${locale}`} className="inline-block mb-6 group">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl group-hover:bg-blue-500/30 transition-all duration-300" />
              <img src="/logo.png?v=2" alt="ConstructionPro" className="relative w-full h-full rounded-2xl object-cover shadow-lg border-2 border-white/50" />
            </div>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">Choose Your Plan</h1>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
            Select the plan that best fits your construction management needs
          </p>
          
          {effectiveStatus !== 'none' && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium animate-fade-in">
              <span className={`w-2 h-2 rounded-full ${effectiveStatus === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={effectiveStatus === 'active' ? 'text-emerald-700' : 'text-red-700'}>
                Current Plan: {currentPlan?.name || 'Unknown'} ({effectiveStatus})
              </span>
            </div>
          )}

          <div className="mt-8 flex items-center justify-center gap-2 p-1.5 bg-slate-100/80 rounded-full w-fit mx-auto">
            <button
              onClick={() => setBillingCycle('month')}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                billingCycle === 'month' 
                  ? 'bg-white text-blue-600 shadow-md' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('year')}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                billingCycle === 'year' 
                  ? 'bg-white text-blue-600 shadow-md' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
              <span className={`ml-1.5 text-xs ${billingCycle === 'year' ? 'text-emerald-500' : 'text-emerald-600/60'}`}>
                {billingCycle === 'year' && 'Save up to 50%'}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const isCurrentPlan = currentSubscription?.tier === plan.id
            const isPopular = plan.id === 'professional'
            const price = billingCycle === 'month' ? plan.price : plan.yearlyPrice
            const savings = billingCycle === 'year' ? Math.round(plan.price * 12 - plan.yearlyPrice) : 0
            
            return (
              <div
                key={plan.id}
                className={`relative group animate-fade-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`
                  h-full rounded-3xl p-8 transition-all duration-300
                  ${isPopular 
                    ? 'bg-gradient-to-br from-blue-50 via-white to-indigo-50/30 border-2 border-blue-200 shadow-lg shadow-blue-500/10 group-hover:shadow-xl group-hover:shadow-blue-500/20' 
                    : 'bg-white border border-slate-200 shadow-sm group-hover:shadow-md group-hover:border-slate-300'
                  }
                `}>
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg shadow-blue-500/25">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900">${price}</span>
                      <span className="text-slate-500 font-medium">/{billingCycle === 'month' ? 'month' : 'year'}</span>
                    </div>
                    {billingCycle === 'year' && savings > 0 && (
                      <div className="text-sm text-emerald-600 font-medium mt-1">
                        Save ${savings}/year
                      </div>
                    )}
                  </div>

                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className={`text-xs ${plan.limits.maxProjects === -1 ? '' : ''}`}>
                          {plan.limits.maxProjects === -1 ? '∞' : plan.limits.maxProjects}
                        </span>
                      </div>
                      <span className="text-slate-600">Projects</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-xs">
                          {plan.limits.maxWorkers === -1 ? '∞' : plan.limits.maxWorkers}
                        </span>
                      </div>
                      <span className="text-slate-600">Workers</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center">
                        <span className="text-xs">
                          {plan.limits.maxInventoryItems === -1 ? '∞' : plan.limits.maxInventoryItems}
                        </span>
                      </div>
                      <span className="text-slate-600">Inventory Items</span>
                    </div>
                  </div>

                  <ul className="mb-8 space-y-2">
                    {plan.limits.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-700">
                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>
                          {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    {isCurrentPlan && effectiveStatus === 'active' ? (
                      <button
                        disabled
                        className="w-full py-3.5 rounded-xl font-medium text-slate-500 bg-slate-100 cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : effectiveStatus !== 'none' && !isCurrentPlan ? (
                      <button
                        onClick={() => setSelectedPlan(plan.id)}
                        disabled={!!loading}
                        className={`w-full py-3.5 rounded-xl font-medium transition-all duration-200 ${
                          loading 
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                            : isPopular
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 magnetic-btn' 
                              : 'bg-slate-900 text-white hover:bg-slate-800 magnetic-btn'
                        }`}
                      >
                        {loading === plan.id ? 'Processing...' : `Upgrade to ${plan.name}`}
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedPlan(plan.id)}
                        disabled={!!loading}
                        className={`w-full py-3.5 rounded-xl font-medium transition-all duration-200 ${
                          loading 
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                            : isPopular
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 magnetic-btn'
                              : 'bg-slate-900 text-white hover:bg-slate-800 magnetic-btn'
                        }`}
                      >
                        {loading === plan.id ? 'Processing...' : `Subscribe to ${plan.name}`}
                      </button>
                    )}

                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                      <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-colors"
                      >
                        VISA CARD
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-md hover:bg-red-700 transition-colors"
                      >
                        MASTER CARD
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-md hover:bg-blue-600 transition-colors"
                      >
                        PAYPAL
                      </button>
                    </div>

                    {abaConfig.enabled && (
                      <button
                        onClick={() => {
                          setSelectedPlan(plan.id)
                          setPaymentMethod('aba')
                        }}
                        disabled={!!loading}
                        className={`w-full mt-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          loading 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : 'border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {loading === plan.id ? 'Processing...' : 'Pay with ABA Payway'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {effectiveStatus !== 'none' && currentSubscription && (
          <div className="text-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={handleManageSubscription}
              disabled={!!loading}
              className="text-slate-500 hover:text-slate-700 text-sm underline underline-offset-2"
            >
              {loading === 'manage' ? 'Loading...' : 'Manage billing & subscription'}
            </button>
            {currentSubscription.status === 'canceled' && (
              <p className="text-xs text-slate-500 mt-2">
                Your subscription will end on {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Payment Method Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-fade-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Choose Payment Method</h2>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Payment Method Tabs */}
              <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-full mb-6">
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex-1 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                    paymentMethod === 'stripe' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  💳 Card
                </button>
                {abaConfig.enabled && (
                  <button
                    onClick={() => setPaymentMethod('aba')}
                    className={`flex-1 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                      paymentMethod === 'aba' 
                        ? 'bg-white text-blue-600 shadow-md' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🏦 ABA Pay
                  </button>
                )}
              </div>

              {paymentMethod === 'stripe' && (
                <div className="space-y-6">
                  <p className="text-slate-600">
                    Pay securely with your credit or debit card via Stripe
                  </p>
                  <button
                    onClick={() => handleSubscribe(selectedPlan)}
                    disabled={!!loading}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 ${
                      loading 
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg magnetic-btn'
                    }`}
                  >
                    {loading === selectedPlan ? 'Processing...' : 'Continue to Payment'}
                  </button>
                  <div className="flex flex-wrap justify-center gap-3 pt-3">
                      <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-colors"
                      >
                        VISA CARD
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-md hover:bg-red-700 transition-colors"
                      >
                        MASTER CARD
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-md hover:bg-blue-600 transition-colors"
                      >
                        PAYPAL
                      </button>
                    </div>
                </div>
              )}
              {paymentMethod === 'aba' && abaConfig.enabled && selectedPlan && orderIdBase && (
                <div className="space-y-4">
                  <ABAPaywayQR
                    orderId={`${orderIdBase}-${Date.now()}`}
                    amount={SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.[billingCycle === 'year' ? 'yearlyPrice' : 'price'] || 0}
                    planName={SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name || 'Plan'}
                    currency="USD"
                    description={`${SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name} subscription - ${billingCycle}`}
                  />
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-700">
                      ℹ️ After completing payment, your subscription will be verified within 24 hours.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-12 text-center animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="inline-block bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Need a custom solution?</h3>
            <p className="text-slate-600 mb-4">
              Contact us for enterprise pricing with custom integrations and dedicated support.
            </p>
            <a href="mailto:enterprise@constructionpro.app" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              enterprise@constructionpro.app
            </a>
          </div>
        </div>

        <div className="text-center mt-8 text-xs text-slate-500 space-y-1">
          <p>Secure payments powered by Stripe. Cancel anytime.</p>
          <p>&copy; 2026 BEE-TRUST ENGINEERING. All rights reserved.</p>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={handleDemoMode}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-full font-medium hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 magnetic-btn"
          >
            <span>✨</span>
            <span>Try Demo Mode (Free)</span>
          </button>
          <p className="text-xs text-slate-500 mt-3">Test all features without payment</p>
        </div>
      </div>
    </div>
  )
}