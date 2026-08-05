'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { authDb, subscriptionDb, demoDb } from '../../lib/db'

export default function Signup() {
  const router = useRouter()
  const locale = useLocale()
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
      const user = await authDb.register({
        email,
        fullName,
        companyName,
        role: 'admin',
        userType: 'company_admin',
        managementLevel: 'company_admin',
        permissions: [],
        password
      })
      
      if (!user) {
        setError('Email already registered. Please login instead.')
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white/95 border border-white/20 shadow-2xl p-8 backdrop-blur-xl">
          <div className="flex flex-col items-center mb-6 text-center">
            <img src="/logo.png?v=2" alt="Construction Pro" className="w-16 h-16 rounded-2xl shadow-lg mb-4" />
            <h1 className="text-2xl font-bold text-slate-900">CONSTRUCTION PRO</h1>
            <p className="text-slate-500 text-sm mt-1">Create your company account and manage projects.</p>
          </div>

          <h2 className="text-xl font-semibold text-slate-800 mb-5 text-center">Create Account</h2>

          {error && (
            <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 p-4">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-3">
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
                autoComplete="name"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">Company Name</label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
                autoComplete="organization"
                placeholder="Acme Builders LLC"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Business Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="admin@company.com"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                  autoComplete="new-password"
                  placeholder="Create a secure password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
                autoComplete="new-password"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href={`/${locale}`} className="font-semibold text-blue-600 hover:text-blue-700">
              Sign In
            </Link>
          </p>

          <p className="mt-3 text-center text-sm text-slate-500">
            Are you a worker?{' '}
            <Link href={`/${locale}/signup/worker`} className="font-semibold text-blue-600 hover:text-blue-700">
              Sign Up as Worker
            </Link>
          </p>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200"
          >
            {loading ? 'Loading Demo...' : 'Try Demo Mode'}
          </button>
        </div>
      </div>
    </div>
  )
}
