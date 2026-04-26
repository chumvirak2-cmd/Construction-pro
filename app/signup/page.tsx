'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { authDb, companyDb } from '../lib/db'

export default function Signup() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password || !fullName || !companyName) {
      setError('Please fill in all fields')
      return
    }
    
    // Register company first
    const company = companyDb.register({
      name: companyName,
      email,
      phone: '',
      address: ''
    })
    
    // Register admin user for the company
    const user = authDb.register({
      email,
      fullName,
      companyName,
      role: 'admin',
      userType: 'company_admin',
      managementLevel: 'company_admin',
      permissions: []
    })
    
    router.push('/subscription')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: 'clamp(8px, 3vw, 24px)', paddingBottom: 'env(safe-area-inset-bottom, 16px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ background: 'white', padding: 'clamp(16px, 5vw, 32px)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
          <img src="/logo.png?v=2" alt="Construction Pro" style={{ width: 'clamp(56px, 18vw, 80px)', height: 'clamp(56px, 18vw, 80px)', borderRadius: '50%', marginBottom: '12px' }} />
          <h1 style={{ fontSize: 'clamp(16px, 5vw, 22px)', fontWeight: 'bold', margin: 0 }}>CONSTRUCTION PRO</h1>
          <p style={{ color: '#6b7280', fontSize: 'clamp(11px, 3.5vw, 13px)', marginTop: '4px' }}>AI Agent for MEP Companies</p>
        </div>
        <h2 style={{ fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>Company Registration</h2>
        {error && <p style={{ color: '#dc2626', fontSize: 'clamp(12px, 3.5vw, 14px)', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}
        <form onSubmit={handleSignup}>
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
            <label style={{ display: 'block', fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: 500 }}>Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{ marginTop: '4px', display: 'block', width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px 14px', fontSize: '16px', boxSizing: 'border-box' }}
              required
              autoComplete="organization"
            />
          </div>
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
              autoComplete="new-password"
            />
          </div>
          <button type="submit" style={{ width: '100%', background: '#3b82f6', color: 'white', padding: '14px', borderRadius: '8px', fontWeight: 600, fontSize: '16px', border: 'none', cursor: 'pointer', touchAction: 'manipulation', minHeight: '48px' }}>
            Sign Up
          </button>
        </form>
        <p style={{ marginTop: '14px', textAlign: 'center', fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
          Already have an account? <Link href="/" style={{ color: '#3b82f6', fontWeight: 600 }}>Sign In</Link>
        </p>
        <p style={{ marginTop: '8px', textAlign: 'center', fontSize: 'clamp(11px, 3vw, 12px)' }}>
          Are you a worker? <Link href="/signup/worker" style={{ color: '#10b981', fontWeight: 600 }}>Sign Up as Worker</Link>
        </p>
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
          <p style={{ margin: 0 }}>&copy; 2026 BEE-TRUST ENGINEERING</p>
          <p style={{ margin: 0 }}>All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
