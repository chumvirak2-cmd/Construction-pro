'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { authDb, subscriptionDb, demoDb } from '../lib/db'

const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 animate-gradient bg-[length:300%]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-30" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
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

export default function AuthPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('page')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      const user = authDb.getCurrentUser()
      if (user) {
        const sub = subscriptionDb.getByUserId(user.id)
        if (sub && (sub.status === 'active' || sub.status === 'trialing')) {
          demoDb.disableDemoMode()
          router.push(`/${locale}/dashboard`)
          return
        }
      }

      const isDemo = demoDb.isDemoMode()
      if (isDemo) {
        router.push(`/${locale}/dashboard`)
        return
      }

      setCheckingAuth(false)
    })
  }, [router, locale])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError(t('auth.errorRequired'))
      setLoading(false)
      return
    }

    try {
      const user = authDb.login(email, password)
      if (!user) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      const subscription = subscriptionDb.getByUserId(user.id)
      if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
        setError('Your subscription is inactive. Please check your subscription status.')
        setLoading(false)
        return
      }

      demoDb.disableDemoMode()
      localStorage.setItem('loggedIn', 'true')
      router.push(`/${locale}/dashboard`)
    } catch (err) {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      demoDb.enableDemoMode()
      localStorage.setItem('loggedIn', 'true')
      router.push(`/${locale}/dashboard`)
    } catch (err) {
      setError('Failed to load demo. Please try again.')
      setLoading(false)
    }
  }

  if (checkingAuth) return <LoadingSpinner />

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="w-full max-w-[420px] relative z-10 animate-fade-up">
        <div className="glass-card p-8 md:p-10">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl" />
              <img 
                src="/logo.png?v=2" 
                alt="Construction Pro" 
                className="relative w-20 h-20 rounded-2xl border-2 border-white/30 shadow-xl object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-construction-900 tracking-tight">CONSTRUCTION PRO</h1>
            <p className="text-construction-500 text-sm mt-2">Sign in to manage your team, workers, and projects.</p>
          </div>

          <h2 className="text-lg font-semibold text-construction-800 mb-6 text-center">Welcome back</h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 animate-fade-in">
              <p className="text-red-600 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-construction-700">Email</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-modern pl-10"
                  required
                  autoComplete="email"
                  inputMode="email"
                  placeholder="Enter your email"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-construction-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-construction-700">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-modern pl-10 pr-10"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-construction-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
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

            <button 
              type="submit" 
              disabled={loading} 
              className="gradient-btn-primary w-full py-3.5 text-base magnetic-btn"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                t('auth.signIn')
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-construction-400">or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="gradient-btn-secondary w-full py-3.5 text-base magnetic-btn"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading Demo...
              </span>
            ) : (
              'Try Demo Mode'
            )}
          </button>

          <p className="mt-8 text-center text-sm text-construction-600">
            {t('navigation.noAccount')}{' '}
            <Link 
              href={`/${locale}/signup`} 
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              {t('navigation.signUp')}
            </Link>
          </p>
          
          <p className="mt-3 text-center text-sm text-construction-600">
            {t('navigation.isWorker')}{' '}
            <Link 
              href={`/${locale}/signup/worker`} 
              className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
            >
              {t('navigation.workerSignUp')}
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-white/50">
          {t('footer.copyright')} · {t('footer.rights')}
        </p>
      </div>
    </div>
  )
}
