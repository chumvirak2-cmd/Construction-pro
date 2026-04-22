'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { authDb, subscriptionDb, demoDb } from './lib/db'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const isDemo = demoDb.isDemoMode()
    if (isDemo) {
      router.push('/dashboard')
      return
    }
    
    const user = authDb.getCurrentUser()
    if (user) {
      const sub = subscriptionDb.getByUserId(user.id)
      if (sub && (sub.status === 'active' || sub.status === 'trialing')) {
        router.push('/dashboard')
      }
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }
    
    localStorage.setItem('loggedIn', 'true')
    router.push('/dashboard')
  }

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault()
    demoDb.enableDemoMode()
    localStorage.setItem('loggedIn', 'true')
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: 'clamp(8px, 3vw, 24px)', paddingBottom: 'env(safe-area-inset-bottom, 16px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ background: 'white', padding: 'clamp(16px, 5vw, 32px)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
          <img src="/logo.png?v=2" alt="Construction Pro" style={{ width: 'clamp(56px, 18vw, 80px)', height: 'clamp(56px, 18vw, 80px)', borderRadius: '50%', marginBottom: '12px' }} />
          <h1 style={{ fontSize: 'clamp(16px, 5vw, 22px)', fontWeight: 'bold', margin: 0 }}>CONSTRUCTION PRO</h1>
          <p style={{ color: '#6b7280', fontSize: 'clamp(11px, 3.5vw, 13px)', marginTop: '4px' }}>AI Agent for MEP Companies</p>
        </div>
        <h2 style={{ fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>Sign In</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginTop: '4px', display: 'block', width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px 14px', fontSize: '16px', boxSizing: 'border-box' }}
              required
              autoComplete="email"
              inputMode="email"
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: 500 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginTop: '4px', display: 'block', width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px 14px', fontSize: '16px', boxSizing: 'border-box' }}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" style={{ width: '100%', background: '#3b82f6', color: 'white', padding: '14px', borderRadius: '8px', fontWeight: 600, fontSize: '16px', border: 'none', cursor: 'pointer', touchAction: 'manipulation', minHeight: '48px' }}>
            Sign In
          </button>
        </form>
        <button 
          type="button"
          onClick={handleDemoLogin}
          style={{ width: '100%', background: '#10b981', color: 'white', padding: '14px', borderRadius: '8px', fontWeight: 600, fontSize: '16px', border: 'none', cursor: 'pointer', marginTop: '10px', touchAction: 'manipulation', minHeight: '48px' }}
        >
          Try Demo (Free)
        </button>
        <p style={{ marginTop: '14px', textAlign: 'center', fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
          Don&apos;t have an account? <Link href="/signup" style={{ color: '#3b82f6', fontWeight: 600 }}>Sign Up</Link>
        </p>
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
          <p style={{ margin: 0 }}>&copy; 2026 BEE-TRUST ENGINEERING</p>
          <p style={{ margin: 0 }}>All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
