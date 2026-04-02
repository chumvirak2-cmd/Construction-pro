'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      alert('Account created! Please sign in.')
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="Construction Pro" className="w-32 h-32 md:w-48 md:h-48 mb-4 rounded-full" />
          <h1 className="text-xl md:text-2xl font-bold">CONSTRUCTION PRO</h1>
          <p className="text-gray-500 text-sm mt-1">AI Agent for MEP Companies</p>
        </div>
        <h2 className="text-lg font-semibold mb-4 text-center">Sign Up</h2>
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3"
              style={{ fontSize: '16px' }}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3"
              style={{ fontSize: '16px' }}
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md font-medium">
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account? <Link href="/" className="text-blue-500 font-medium">Sign In</Link>
        </p>
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>© 2026 BEE-TRUST ENGINEERING</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
