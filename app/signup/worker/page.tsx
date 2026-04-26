'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { authDb, companyDb } from '../../lib/db'

export default function WorkerSignup() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [error, setError] = useState('')

  const handleWorkerSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password || !fullName || !companyEmail) {
      setError('Please fill in all fields')
      return
    }
    
    // Find company by email domain or exact match
    const company = companyDb.findByEmail(companyEmail)
    if (!company) {
      setError('Company not found. Please check with your employer.')
      return
    }
    
    // Check if user already exists
    const existingUser = authDb.getByEmail(email)
    if (existingUser) {
      setError('Email already registered. Please login instead.')
      return
    }
    
    // Register worker associated with company
    const worker = authDb.register({
      email,
      fullName,
      companyName: company.name,
      role: 'user',
      userType: 'worker',
      companyId: company.id
    })
    
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: 'clamp(8px, 3vw, 24px)', paddingBottom: 'env(safe-area-inset-bottom, 16px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ background: 'white', padding: 'clamp(16px, 5vw, 32px)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
          <img src="/logo.png?v=2" alt="Construction Pro" style={{ width: 'clamp(56px, 18vw, 80px)', height: 'clamp(56px, 18vw, 80px)', borderRadius: '50%', marginBottom: '12px' }} />
          <h1 style={{ fontSize: 'clamp(16px, 5vw, 22px)', fontWeight: 'bold', margin: 0 }}>CONSTRUCTION PRO</h1>
          <p style={{ color: '#6b7280', fontSize: 'clamp(11px, 3.5vw, 13px)', marginTop: '4px' }}>Worker Registration</p>
        </div>
        <h2 style={{ fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>Sign Up as Worker</h2>
        {error && <p style={{ color: '#dc2626', fontSize: 'clamp(12px, 3.5vw, 14px)', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}
        <form onSubmit={handleWorkerSignup}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: 500 }}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ marginTop: '4px', display: 'block', width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px 14px', fontSize: '16px', boxSizing: 'border-box' }}
              required
              autoComplete="name"
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: 500 }}>Your Email</label>
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
              autoComplete="new-password"
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: 500 }}>Company Email (to verify)</label>
            <input
              type="email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              style={{ marginTop: '4px', display: 'block', width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px 14px', fontSize: '16px', boxSizing: 'border-box' }}
              required
              placeholder="Enter your company's email"
              autoComplete="email"
              inputMode="email"
            />
            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
              Your company must have an active subscription
            </p>
          </div>
          <button type="submit" style={{ width: '100%', background: '#10b981', color: 'white', padding: '14px', borderRadius: '8px', fontWeight: 600, fontSize: '16px', border: 'none', cursor: 'pointer', touchAction: 'manipulation', minHeight: '48px' }}>
            Sign Up as Worker
          </button>
        </form>
        <p style={{ marginTop: '14px', textAlign: 'center', fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
          Already have an account? <Link href="/" style={{ color: '#3b82f6', fontWeight: 600 }}>Sign In</Link>
        </p>
        <p style={{ marginTop: '8px', textAlign: 'center', fontSize: 'clamp(11px, 3vw, 12px)' }}>
          Are you a company owner? <Link href="/signup" style={{ color: '#3b82f6', fontWeight: 600 }}>Register Company</Link>
        </p>
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
          <p style={{ margin: 0 }}>&copy; 2026 BEE-TRUST ENGINEERING</p>
          <p style={{ margin: 0 }}>All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
