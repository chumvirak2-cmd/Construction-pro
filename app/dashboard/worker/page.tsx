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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {user.fullName}</h1>
        <p className="text-green-100">Worker Dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Assigned Projects</p>
          <p className="text-2xl font-bold text-gray-800">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Attendance This Month</p>
          <p className="text-2xl font-bold text-gray-800">0 days</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Status</p>
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Active
          </span>
        </div>
      </div>

      {/* My Profile Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">My Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Full Name</label>
            <p className="text-gray-800">{user.fullName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-800">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Company</label>
            <p className="text-gray-800">{user.companyName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Phone</label>
            <p className="text-gray-800">{user.phone || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Limited Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Available Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/profile" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-medium text-gray-800">View Profile</p>
                <p className="text-sm text-gray-500">Update your information</p>
              </div>
            </div>
          </Link>
          <button disabled className="block p-4 border rounded-lg bg-gray-100 cursor-not-allowed opacity-50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-medium text-gray-500">Salary Information</p>
                <p className="text-sm text-gray-400">Restricted - Manager access only</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          ⚠️ Your access is limited to viewing your profile and assigned tasks. For salary inquiries or other requests, please contact your manager.
        </p>
      </div>
    </div>
  )
}
