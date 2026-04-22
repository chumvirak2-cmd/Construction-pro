'use client'

import { useEffect, useState } from 'react'

export default function Profile() {
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    companyName: 'ABC Construction',
    logoUrl: ''
  })
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('constructionProProfile')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setProfile((prev) => ({ ...prev, ...parsed }))
        if (parsed.logoUrl) setLogoPreview(parsed.logoUrl)
      } catch {
        // ignore invalid stored data
      }
    }
  }, [])

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Persist to local storage (simulated save)
    localStorage.setItem('constructionProProfile', JSON.stringify(profile))
    alert('Profile updated successfully!')
    setIsEditing(false)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setLogoPreview(result)
      setProfile((prev) => ({ ...prev, logoUrl: result }))
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoPreview('')
    setProfile((prev) => ({ ...prev, logoUrl: '' }))
    localStorage.removeItem('constructionProProfileLogo')
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!')
      return
    }
    // Simulate password change
    alert('Password changed successfully!')
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  return (
    <div className="px-1 md:px-0">
      <h1 className="text-lg md:text-2xl font-bold mb-4 md:mb-6">Company Information</h1>
      
      {/* Profile Information */}
      <div className="mb-8">
        {!isEditing ? (
          <div>
            {logoPreview && (
              <div className="mb-4 flex items-center gap-4">
                <img src={logoPreview} alt="Company logo" className="h-24 w-24 object-contain rounded border" />
                <button onClick={removeLogo} className="text-sm text-red-600 underline">
                  Remove logo
                </button>
              </div>
            )}
            <p><strong>Full Name:</strong> {profile.fullName}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Company Name:</strong> {profile.companyName}</p>
            <button onClick={() => setIsEditing(true)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleProfileSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium">Company Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="mt-1 block w-full"
              />
              {logoPreview && (
                <div className="mt-2 flex items-center gap-4">
                  <img src={logoPreview} alt="Logo preview" className="h-20 w-20 object-contain rounded border" />
                  <button type="button" onClick={removeLogo} className="text-sm text-red-600 underline">
                    Remove logo
                  </button>
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 min-h-[44px]"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 min-h-[44px]"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Company Name</label>
              <input
                type="text"
                value={profile.companyName}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 min-h-[44px]"
                required
              />
            </div>
            <button type="submit" className="bg-green-500 text-white px-4 py-2.5 rounded mr-2 min-h-[44px]">
              Save Changes
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2.5 rounded min-h-[44px]">
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Change Password */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit}>
<div className="mb-4">
            <label className="block text-sm font-medium">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 min-h-[44px]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 min-h-[44px]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 min-h-[44px]"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2.5 rounded min-h-[44px]">
            Change Password
          </button>
        </form>
      </div>
    </div>
  )
}