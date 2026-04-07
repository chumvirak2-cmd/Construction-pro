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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: '12px', overflowY: 'auto' }}>
      <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', width: '100%', maxWidth: '360px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
          <img src="/logo.png?v=2" alt="Construction Pro" style={{ width: '70px', height: '70px', borderRadius: '50%', marginBottom: '8px' }} />
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>CONSTRUCTION PRO</h1>
          <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>AI Agent for MEP Companies</p>
        </div>
        <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', textAlign: 'center' }}>Sign In</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginTop: '4px', display: 'block', width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 10px', fontSize: '14px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginTop: '4px', display: 'block', width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 10px', fontSize: '14px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <button type="submit" style={{ width: '100%', background: '#3b82f6', color: 'white', padding: '10px', borderRadius: '6px', fontWeight: 500, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
            Sign In
          </button>
        </form>
        <button 
          type="button"
          onClick={handleDemoLogin}
          style={{ width: '100%', background: '#10b981', color: 'white', padding: '10px', borderRadius: '6px', fontWeight: 500, fontSize: '14px', border: 'none', cursor: 'pointer', marginTop: '8px' }}
        >
          Try Demo (Free)
        </button>
        <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '12px' }}>
          Don&apos;t have an account? <Link href="/signup" style={{ color: '#3b82f6', fontWeight: 500 }}>Sign Up</Link>
        </p>
        <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '10px', color: '#9ca3af' }}>
          <p style={{ margin: 0 }}>&copy; 2026 BEE-TRUST ENGINEERING</p>
          <p style={{ margin: 0 }}>All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
