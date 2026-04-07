'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { authDb } from '../lib/db'

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
    
    const user = authDb.register({
      email,
      fullName,
      companyName,
      role: 'admin'
    })
    
    router.push('/subscription')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: '12px', overflowY: 'auto' }}>
      <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', width: '100%', maxWidth: '360px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
          <img src="/logo.png?v=2" alt="Construction Pro" style={{ width: '70px', height: '70px', borderRadius: '50%', marginBottom: '8px' }} />
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>CONSTRUCTION PRO</h1>
          <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>AI Agent for MEP Companies</p>
        </div>
        <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', textAlign: 'center' }}>Sign Up</h2>
        {error && <p style={{ color: '#dc2626', fontSize: '12px', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}
        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500 }}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ marginTop: '4px', display: 'block', width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 10px', fontSize: '14px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500 }}>Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{ marginTop: '4px', display: 'block', width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 10px', fontSize: '14px', boxSizing: 'border-box' }}
              required
            />
          </div>
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
            Sign Up
          </button>
        </form>
        <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '12px' }}>
          Already have an account? <Link href="/" style={{ color: '#3b82f6', fontWeight: 500 }}>Sign In</Link>
        </p>
        <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '10px', color: '#9ca3af' }}>
          <p style={{ margin: 0 }}>&copy; 2026 BEE-TRUST ENGINEERING</p>
          <p style={{ margin: 0 }}>All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
