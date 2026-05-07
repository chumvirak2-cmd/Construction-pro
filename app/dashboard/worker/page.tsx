'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authDb } from '../../lib/db'
import { hasPermission, FeaturePermissions } from '../../lib/permissions'
import Link from 'next/link'

export default function WorkerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(authDb.getCurrentUser())
  const [workerProfile, setWorkerProfile] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    // Check if user is a worker
    if (user.managementLevel !== 'worker') {
      router.push('/dashboard')
      return
    }
  }, [user, router])

  if (!user || user.managementLevel !== 'worker') {
    return null
  }

  const [currentTime, setCurrentTime] = useState(new Date())
  const [isCheckedIn, setIsCheckedIn] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCheckIn = () => {
    setIsCheckedIn(true)
    // TODO: Implement actual check-in logic
  }

  const handleCheckOut = () => {
    setIsCheckedIn(false)
    // TODO: Implement actual check-out logic
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 landscape:p-8 bg-gray-50">
      <div className="w-full max-w-4xl space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white text-center landscape:flex landscape:justify-between landscape:items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user.fullName}</h1>
            <p className="text-green-100">Worker Dashboard</p>
          </div>
          <div className="mt-4 landscape:mt-0 text-right">
            <p className="text-3xl font-mono">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-sm text-green-100">
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Check In/Out Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCheckIn}
            disabled={isCheckedIn}
            className={`p-8 rounded-xl text-white font-bold text-xl transition-all ${
              isCheckedIn ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
            }`}
          >
            CHECK IN
          </button>
          <button
            onClick={handleCheckOut}
            disabled={!isCheckedIn}
            className={`p-8 rounded-xl text-white font-bold text-xl transition-all ${
              !isCheckedIn ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 active:scale-95'
            }`}
          >
            CHECK OUT
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500 text-center">
            <p className="text-sm text-gray-500">Projects</p>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500 text-center">
            <p className="text-sm text-gray-500">Attendance</p>
            <p className="text-2xl font-bold text-gray-800">0 days</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500 text-center">
            <p className="text-sm text-gray-500">Status</p>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-sm text-yellow-800">
            ⚠️ Rotate device to landscape for optimal check-in experience
          </p>
        </div>
      </div>
    </div>
  )
}
