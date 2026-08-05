'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { authDb, companyDb, subscriptionDb, demoDb } from '../../../lib/db'

const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10">
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 animate-gradient bg-[length:300%]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-20" />
      <div className="absolute top-10 left-1/3 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-float-delayed" />
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

export default function WorkerSignup() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('page')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleWorkerSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (!email || !password || !fullName || !companyEmail) {
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
      let companyId: string | undefined
      let companyName = 'Demo Company'
      
      try {
        const companyRes = await fetch(`/api/companies?email=${encodeURIComponent(companyEmail)}`)
        if (companyRes.ok) {
          const company = await companyRes.json()
          companyId = company.id
          companyName = company.name
        }
      } catch {
        const localCompanies = companyDb.getAll()
        const localCompany = localCompanies.find((c) => c.email?.toLowerCase() === companyEmail.toLowerCase())
        if (localCompany) {
          companyId = localCompany.id
          companyName = localCompany.name
        }
      }
      
      if (!companyId) {
        setError('Company not found. Please check with your employer.')
        setLoading(false)
        return
      }

      const worker = await authDb.register({
        email,
        fullName,
        companyName,
        companyId,
        role: 'user',
        userType: 'worker',
        managementLevel: 'worker',
        permissions: [],
        password
      })
      
      if (!worker) {
        setError('Error creating account. Please try again.')
        setLoading(false)
        return
      }
      
      subscriptionDb.create({
        userId: worker.id,
        tier: 'starter',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false
      })
      
      localStorage.setItem('loggedIn', 'true')
      router.push(`/${locale}/dashboard`)
    } catch (err) {
      setError('Error creating account. Please try again.')
      setLoading(false)
    }
  }

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      demoDb.enableDemoMode()
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

      <div className="w-full max-w-[420px] relative z-10 animate-fade-up">
        <div className="glass-card p-8 md:p-10">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-teal-500/30 rounded-2xl blur-xl" />
              <img 
                src="/logo.png?v=2" 
                alt="Construction Pro" 
                className="relative w-20 h-20 rounded-2xl border-2 border-white/30 shadow-xl object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-construction-900 tracking-tight">CONSTRUCTION PRO</h1>
            <p className="text-construction-500 text-sm mt-2">Worker Registration</p>
          </div>

          <h2 className="text-lg font-semibold text-construction-800 mb-6 text-center">Sign Up as Worker</h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 animate-fade-in">
              <p className="text-red-600 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleWorkerSignup} className="space-y-5">
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
              <label htmlFor="email" className="block text-sm font-medium text-construction-700">Your Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="companyEmail" className="block text-sm font-medium text-construction-700">Company Email (to verify)</label>
              <input
                id="companyEmail"
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="input-modern"
                required
                placeholder="admin@company.com"
                autoComplete="email"
                inputMode="email"
              />
              <p className="text-xs text-construction-400 mt-1.5 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Your company must have an active subscription
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-construction-700">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-modern pr-10"
                  required
                  autoComplete="new-password"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-construction-400 hover:text-construction-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l-3.293-3.293m0 0a3 3 0 104.243-4.243l3.536 3.536M12 12h.01" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.543-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-construction-700">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-modern"
                required
                autoComplete="new-password"
                placeholder="Confirm your password"
              />
            </div>

            <button type="submit" disabled={loading} className="gradient-btn-secondary w-full py-3.5 text-base magnetic-btn">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Sign Up as Worker'
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
            Are you a company owner?{' '}
            <Link 
              href={`/${locale}/signup`} 
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              Register Company
            </Link>
          </p>

          <div className="mt-6">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="gradient-btn-primary w-full py-3.5 text-base magnetic-btn"
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
