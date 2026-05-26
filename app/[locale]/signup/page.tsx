'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { authDb, companyDb, subscriptionDb, demoDb } from '../../lib/db'

export default function Signup() {
  const router = useRouter()
  const locale = useLocale()
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (!email || !password || !fullName || !companyName) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }
    
    try {
      // Check if email already exists
      const existingUser = authDb.getByEmail(email)
      if (existingUser) {
        setError('Email already registered. Please login instead.')
        setLoading(false)
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
        permissions: [],
        password
      })
      
      // Create a trial subscription for the new user
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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: 'clamp(8px, 3vw, 24px)', paddingBottom: 'env(safe-area-inset-bottom, 16px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
       <div style={{ background: 'white', padding: 'clamp(16px, 5vw, 32px)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
           <img src="/logo.png?v=2" alt="Construction Pro" style={{ width: 'clamp(56px, 18vw, 80px)', height: 'clamp(56px, 18vw, 80px)', borderRadius: '50%', marginBottom: '12px' }} />
           <h1 style={{ fontSize: 'clamp(16px, 5vw, 22px)', fontWeight: 'bold', margin: 0 }}>CONSTRUCTION PRO</h1>
           <p style={{ color: '#6b7280', fontSize: 'clamp(11px, 3.5vw, 13px)', marginTop: '4px' }}>Create your company account and manage projects from a single dashboard.</p>
         </div>
         <h2 style={{ fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>Manager Sign Up</h2>
         {error && <p style={{ color: '#dc2626', fontSize: 'clamp(12px, 3.5vw, 14px)', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}
         <form onSubmit={handleSignup}>
            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="fullName" style={{ display: 'block', fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: 500 }}>Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ marginTop: '4px', display: 'block', width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px 14px', fontSize: '16px', boxSizing: 'border-box' }}
                required
                autoComplete="name"
                placeholder="John Doe"
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="companyName" style={{ display: 'block', fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: 500 }}>Company Name</label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{ marginTop: '4px', display: 'block', width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px 14px', fontSize: '16px', boxSizing: 'border-box' }}
                required
                autoComplete="organization"
                placeholder="Acme Builders LLC"
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="email" style={{ display: 'block', fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: 500 }}>Business Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginTop: '4px', display: 'block', width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px 14px', fontSize: '16px', boxSizing: 'border-box' }}
                required
                autoComplete="email"
                inputMode="email"
                placeholder="admin@company.com"
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="password" style={{ display: 'block', fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: 500 }}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ marginTop: '4px', display: 'block', width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px 14px', fontSize: '16px', boxSizing: 'border-box' }}
                required
                autoComplete="new-password"
                placeholder="Create a secure password"
              />
            </div>
            <button type="submit" disabled={loading} style={{ 
              width: '100%', 
              background: '#3b82f6', 
              color: 'white', 
              padding: '14px', 
              borderRadius: '8px', 
              fontWeight: 600, 
              fontSize: '16px', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              touchAction: 'manipulation', 
              minHeight: '48px', 
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease',
            }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
         </form>
         <p style={{ marginTop: '14px', textAlign: 'center', fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
           Already have an account? <Link href={`/${locale}`} style={{ 
             color: '#3b82f6', 
             fontWeight: 600,
             textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}>Sign In</Link>
         </p>
         <p style={{ marginTop: '8px', textAlign: 'center', fontSize: 'clamp(11px, 3vw, 12px)' }}>
           Are you a worker? <Link href={`/${locale}/signup/worker`} style={{ 
             color: '#10b981', 
             fontWeight: 600,
             textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}>Sign Up as Worker</Link>
         </p>
         <div style={{ marginTop: '16px', textAlign: 'center' }}>
           <button 
             onClick={handleDemoLogin}
             disabled={loading}
             style={{
               width: '100%',
               background: '#10b981',
               color: 'white',
               padding: '14px',
               borderRadius: '8px',
               fontWeight: 600,
               fontSize: '16px',
               border: 'none',
               cursor: loading ? 'not-allowed' : 'pointer',
               marginTop: '10px',
               touchAction: 'manipulation',
               minHeight: '48px',
               opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? 'Loading Demo...' : 'Try Demo Mode'}
           </button>
         </div>
         <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
           <p style={{ margin: 0 }}>&copy; 2026 BEE-TRUST ENGINEERING</p>
           <p style={{ margin: 0 }}>All rights reserved.</p>
         </div>
       </div>
     </div>
  )
}
