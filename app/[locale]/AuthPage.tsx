'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { authDb, subscriptionDb, demoDb } from '../lib/db'

export default function AuthPage() {
  const router = useRouter()
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Please enter email and password')
      setLoading(false)
      return
    }

    try {
      const user = await authDb.login(email, password)
      if (!user) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      const subscription = subscriptionDb.getByUserId(user.id)
      if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
        setError('Your subscription is inactive.')
        setLoading(false)
        return
      }

      demoDb.disableDemoMode()
      localStorage.setItem('loggedIn', 'true')
      router.push(`/${locale}/dashboard`)
    } catch (err) {
      setError('Login failed.')
      setLoading(false)
    }
  }

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      demoDb.enableDemoMode()
      router.push(`/${locale}/dashboard`)
    } catch (err) {
      setError('Failed to load demo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-600 to-indigo-600">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white/80 border border-white/20 shadow-lg p-8">
          <div className="flex flex-col items-center mb-6 text-center">
            <img src="/logo.png" alt="Construction Pro" className="w-16 h-16 rounded-xl shadow-lg mb-4" />
            <h1 className="text-xl font-bold text-slate-800">CONSTRUCTION PRO</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to manage your team.</p>
          </div>

          <h2 className="text-lg font-semibold text-slate-700 mb-4 text-center">Welcome back</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5"
                required
                autoComplete="email"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pr-16"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
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

            <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 text-white rounded-lg">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 bg-emerald-500 text-white rounded-lg mt-4"
          >
            {loading ? 'Loading...' : 'Try Demo Mode'}
          </button>

          <p className="mt-6 text-center text-sm">
            Don't have an account? <Link href={`/${locale}/signup`} className="text-blue-600 font-semibold">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}