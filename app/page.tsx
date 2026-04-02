'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      localStorage.setItem('loggedIn', 'true')
      router.push('/dashboard')
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
        <h2 className="text-lg font-semibold mb-4 text-center">Sign In</h2>
        <form onSubmit={handleLogin}>
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
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don&apos;t have an account? <Link href="/signup" className="text-blue-500 font-medium">Sign Up</Link>
        </p>
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>© 2026 BEE-TRUST ENGINEERING</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
