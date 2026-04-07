'use client'

import { useState, useEffect } from 'react'
import { TeamMember } from '../../types'
import { teamDb, authDb, subscriptionDb } from '../../lib/db'

const ROLE_OPTIONS = [
  { value: 'manager', label: 'Manager', description: 'Full access to all features' },
  { value: 'worker', label: 'Worker', description: 'Can check in/out and view projects' },
  { value: 'viewer', label: 'Viewer', description: 'View-only access' },
  { value: 'marketing', label: 'Marketing', description: 'Can manage marketing and sales leads' },
  { value: 'sell', label: 'Sales', description: 'Can manage sales and proposals' }
]

const PERMISSION_OPTIONS = [
  { value: 'projects', label: 'Projects' },
  { value: 'workers', label: 'Workers & Attendance' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'boq', label: 'BOQ Calculator' },
  { value: 'reports', label: 'Reports' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sell', label: 'Sales' },
  { value: 'users', label: 'Manage Users' },
  { value: 'settings', label: 'Settings' }
]

export default function UsersPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [currentUser, setCurrentUser] = useState(authDb.getCurrentUser())
  const [subscription, setSubscription] = useState(subscriptionDb.getByUserId(currentUser?.id || ''))

  const [form, setForm] = useState({
    email: '',
    fullName: '',
    phone: '',
    role: 'manager' as TeamMember['role'],
    permissions: ['projects', 'workers', 'inventory', 'boq', 'reports'],
    isTrackingEnabled: false
  })
  const [trackingView, setTrackingView] = useState<'list' | 'map'>('list')
  const [siteCenter, setSiteCenter] = useState({ lat: 40.7128, lng: -74.0060 })
  const [siteRadiusMeters, setSiteRadiusMeters] = useState(500)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    if (currentUser) {
      setMembers(teamDb.getByUserId(currentUser.id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingMember) {
      teamDb.update(editingMember.id, {
        fullName: form.fullName,
        phone: form.phone,
        role: form.role,
        permissions: form.permissions,
        isTrackingEnabled: form.isTrackingEnabled
      })
    } else {
      teamDb.invite(
        form.email,
        form.fullName,
        form.role,
        form.permissions,
        currentUser?.id || ''
      )
    }
    
    loadData()
    resetForm()
  }

  const resetForm = () => {
    setForm({
      email: '',
      fullName: '',
      phone: '',
      role: 'manager',
      permissions: ['projects', 'workers', 'inventory', 'boq', 'reports'],
      isTrackingEnabled: false
    })
    setShowForm(false)
    setEditingMember(null)
  }

  const handleEdit = (member: TeamMember) => {
    setForm({
      email: member.email,
      fullName: member.fullName,
      phone: member.phone || '',
      role: member.role,
      permissions: member.permissions,
      isTrackingEnabled: member.isTrackingEnabled || false
    })
    setEditingMember(member)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      teamDb.delete(id)
      loadData()
    }
  }

  const togglePermission = (perm: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }))
  }

  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180
    const R = 6371000
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const getMemberDistance = (member: TeamMember) => {
    if (!member.lastLocation) return null
    return haversineDistance(
      member.lastLocation.lat,
      member.lastLocation.lng,
      siteCenter.lat,
      siteCenter.lng
    )
  }

  const updateMemberLocation = (memberId: string) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords
          const member = members.find(m => m.id === memberId)
          if (member) {
            teamDb.update(memberId, {
              lastLocation: {
                lat: latitude,
                lng: longitude,
                timestamp: new Date().toISOString(),
                accuracy: accuracy
              }
            })
            loadData()
            alert('✓ Location updated!')
          }
        },
        () => {
          alert('Failed to get location. Please enable GPS.')
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  const maxUsers = subscription?.tier === 'enterprise' ? -1 : 
    subscription?.tier === 'professional' ? 10 : 5

  const canAddMore = maxUsers === -1 || members.length < maxUsers

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Team Users</h1>
          <p className="text-gray-500">Manage team members and permissions</p>
        </div>
        <div className="flex gap-2">
          {canAddMore && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Add User
            </button>
          )}
        </div>
      </div>

      {subscription?.tier !== 'enterprise' && subscription?.tier !== 'professional' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-700 text-sm">
            Upgrade to Professional or Enterprise to add more team members. 
            Current plan ({subscription?.tier || 'free'}): {maxUsers} user(s) max.
          </p>
        </div>
      )}

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingMember ? 'Edit User' : 'Invite New User'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingMember && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as TeamMember['role'] })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    {ROLE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} - {opt.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isTrackingEnabled"
                    checked={form.isTrackingEnabled}
                    onChange={(e) => setForm({ ...form, isTrackingEnabled: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isTrackingEnabled" className="text-sm font-medium">
                    Enable Location Tracking
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Permissions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PERMISSION_OPTIONS.map(perm => (
                      <label key={perm.value} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.permissions.includes(perm.value)}
                          onChange={() => togglePermission(perm.value)}
                          className="rounded border-gray-300"
                        />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    {editingMember ? 'Update' : 'Send Invite'}
                  </button>
                  <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Team Members List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Email</th>
              <th className="text-left p-4 font-medium">Role</th>
              <th className="text-left p-4 font-medium">Permissions</th>
              <th className="text-left p-4 font-medium">Location</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No team members yet. Add your first team member.
                </td>
              </tr>
            ) : (
              members.map(member => (
                <tr key={member.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{member.fullName}</td>
                  <td className="p-4 text-gray-500">{member.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      member.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                      member.role === 'worker' ? 'bg-green-100 text-green-700' :
                      member.role === 'marketing' ? 'bg-pink-100 text-pink-700' :
                      member.role === 'sell' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {member.permissions.map(perm => (
                        <span key={perm} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    {member.isTrackingEnabled ? (
                      member.lastLocation ? (
                        <div className="text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            (getMemberDistance(member) || 0) <= siteRadiusMeters 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {(getMemberDistance(member) || 0) <= siteRadiusMeters ? 'At Site' : 'Off Site'}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(getMemberDistance(member) || 0)}m from site
                          </div>
                          <button
                            onClick={() => updateMemberLocation(member.id)}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Update
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => updateMemberLocation(member.id)}
                          className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs"
                        >
                          Track Location
                        </button>
                      )
                    ) : (
                      <span className="text-gray-400 text-xs">Not tracked</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Site Location Settings */}
      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <h3 className="font-semibold mb-3">Site Location Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Site Latitude</label>
            <input
              type="number"
              step="0.000001"
              value={siteCenter.lat || ''}
              onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSiteCenter({ ...siteCenter, lat: isNaN(val) ? 0 : val });
                }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Site Longitude</label>
            <input
              type="number"
              step="0.000001"
              value={siteCenter.lng || ''}
              onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSiteCenter({ ...siteCenter, lng: isNaN(val) ? 0 : val });
                }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Allowed Radius (m)</label>
            <input
              type="number"
              value={siteRadiusMeters || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSiteRadiusMeters(isNaN(val) ? 0 : val);
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-blue-600">{members.length}</div>
          <div className="text-gray-500 text-sm">Total Members</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-blue-600">
            {members.filter(m => m.role === 'manager').length}
          </div>
          <div className="text-gray-500 text-sm">Managers</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-green-600">
            {members.filter(m => m.role === 'worker').length}
          </div>
          <div className="text-gray-500 text-sm">Workers</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-pink-600">
            {members.filter(m => m.role === 'marketing').length}
          </div>
          <div className="text-gray-500 text-sm">Marketing</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-purple-600">
            {subscription?.tier === 'professional' ? '10' : subscription?.tier === 'enterprise' ? '∞' : '3'}
          </div>
          <div className="text-gray-500 text-sm">Max Users</div>
        </div>
      </div>
    </div>
  )
}