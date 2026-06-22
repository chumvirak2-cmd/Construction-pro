'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { authDb, companyDb, subscriptionDb, demoDb } from '../../lib/db'

const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 animate-gradient bg-[length:300%]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-float-delayed" />
    </div>
  </div>
)

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-6">
        <div className="absolute inset-0 rounded-2xl border-4 border-white/20" />
        <div className="absolute inset-0 rounded-2xl border-4 border-white border-t-transparent animate-spin" />
      </div>
      <p className="text-white/80 text-sm font-medium tracking-wide">Loading...</p>
    </div>
  </div>
)

export default function Signup() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('page')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (!email || !password || !fullName || !companyName) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }
    
    try {
      const existingUser = await authDb.getByEmail(email)
      if (existingUser) {
        setError('Email already registered. Please login instead.')
        setLoading(false)
        return
      }
      
      const companyRes = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: companyName,
          email,
          phone: '',
          address: ''
        })
      })
      
      if (!companyRes.ok) {
        setError('Failed to create company.')
        setLoading(false)
        return
      }
      
      const company = await companyRes.json()
      
      const user = await authDb.register({
        email,
        fullName,
        companyName,
        companyId: company.id,
        role: 'admin',
        userType: 'company_admin',
        managementLevel: 'company_admin',
        permissions: [],
        password
      })
      
      if (!user) {
        setError('Error creating account. Please try again.')
        setLoading(false)
        return
      }
      
      subscriptionDb.create({
        userId: user.id,
        tier: 'starter',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false
      })
      
      demoDb.disableDemoMode()
      localStorage.setItem('loggedIn', 'true')
      router.push(`/${locale}/dashboard`)
    } catch (err) {
      setError('Error creating account. Please try again.')
      setLoading(false)
    }
  }

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await demoDb.enableDemoMode()
      localStorage.setItem('loggedIn', 'true')
      router.push(`/${locale}/dashboard`)
    } catch (err) {
      setError('Failed to load demo. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="w-full max-w-[440px] relative z-10 animate-fade-up">
        <div className="glass-card p-8 md:p-10">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-blue-500/30 rounded-2xl blur-xl" />
              <img 
                src="/logo.png?v=2" 
                alt="Construction Pro" 
                className="relative w-20 h-20 rounded-2xl border-2 border-white/30 shadow-xl object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-construction-900 tracking-tight">CONSTRUCTION PRO</h1>
            <p className="text-construction-500 text-sm mt-2">Create your company account and manage projects.</p>
          </div>

          <h2 className="text-lg font-semibold text-construction-800 mb-6 text-center">Create Account</h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 animate-fade-in">
              <p className="text-red-600 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-construction-700">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-modern"
                  required
                  autoComplete="name"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="companyName" className="block text-sm font-medium text-construction-700">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input-modern"
                  required
                  autoComplete="organization"
                  placeholder="Acme Builders LLC"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-construction-700">Business Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="admin@company.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-construction-700">Password</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-modern"
                required
                autoComplete="new-password"
                placeholder="Create a secure password"
              />
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{
                    width: password.length === 0 ? '0%' : password.length <= 4 ? '25%' : password.length <= 6 ? '50%' : password.length <= 8 ? '75%' : '100%'
                  }}
                />
              </div>
              <p className="text-[11px] text-construction-400">Use 6+ characters for stronger security</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-construction-700">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input-modern transition-all duration-200 ${confirmPassword && password && confirmPassword !== password ? 'border-red-300 ring-red-100' : confirmPassword && password && confirmPassword === password ? 'border-emerald-300 ring-emerald-100' : ''}`}
                required
                autoComplete="new-password"
                placeholder="Confirm your password"
              />
              {confirmPassword && password && (
                <p className={`text-xs font-medium flex items-center gap-1.5 ${confirmPassword !== password ? 'text-red-500' : 'text-emerald-600'}`}>
                  {confirmPassword !== password ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Passwords do not match
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Passwords match
                    </>
                  )}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="gradient-btn-primary w-full py-3.5 text-base magnetic-btn">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-construction-600">
            Already have an account?{' '}
            <Link 
              href={`/${locale}`} 
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </p>

          <p className="mt-3 text-center text-sm text-construction-600">
            Are you a worker?{' '}
            <Link 
              href={`/${locale}/signup/worker`} 
              className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
            >
              Sign Up as Worker
            </Link>
          </p>

          <div className="mt-6">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="gradient-btn-secondary w-full py-3.5 text-base magnetic-btn"
            >
              {loading ? 'Loading Demo...' : 'Try Demo Mode'}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-white/50">
          {t('footer.copyright')} · {t('footer.rights')}
        </p>
      </div>
    </div>
  )
}
