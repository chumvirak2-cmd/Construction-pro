'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authDb, subscriptionDb, SUBSCRIPTION_PLANS, getPlan } from '../../lib/db'

interface AppSettings {
  currency: string
  timezone: string
  language: string
  emailNotifications: boolean
  pushNotifications: boolean
  dailySummary: boolean
  weeklyReport: boolean
  theme: 'light' | 'dark' | 'system'
  defaultProjectView: 'grid' | 'list'
  autoSave: boolean
  compactMode: boolean
}

const defaultSettings: AppSettings = {
  currency: 'USD',
  timezone: 'Asia/Bangkok',
  language: 'en',
  emailNotifications: true,
  pushNotifications: true,
  dailySummary: false,
  weeklyReport: true,
  theme: 'system',
  defaultProjectView: 'grid',
  autoSave: true,
  compactMode: false
}

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    const stored = localStorage.getItem('constructionProSettings')
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) })
      } catch {
        // ignore invalid stored data
      }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('constructionProSettings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExportData = () => {
    const data = {
      projects: localStorage.getItem('constructionProProjects'),
      workers: localStorage.getItem('constructionProWorkers'),
      inventory: localStorage.getItem('constructionProInventory'),
      profile: localStorage.getItem('constructionProProfile'),
      settings: localStorage.getItem('constructionProSettings'),
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `construction-pro-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data.projects) localStorage.setItem('constructionProProjects', data.projects)
        if (data.workers) localStorage.setItem('constructionProWorkers', data.workers)
        if (data.inventory) localStorage.setItem('constructionProInventory', data.inventory)
        if (data.profile) localStorage.setItem('constructionProProfile', data.profile)
        if (data.settings) {
          localStorage.setItem('constructionProSettings', data.settings)
          setSettings({ ...defaultSettings, ...JSON.parse(data.settings) })
        }
        alert('Data imported successfully!')
      } catch {
        alert('Failed to import data. Invalid file format.')
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('constructionProProjects')
      localStorage.removeItem('constructionProWorkers')
      localStorage.removeItem('constructionProInventory')
      localStorage.removeItem('constructionProProfile')
      alert('All data has been cleared.')
    }
  }

  const tabs = [
    { id: 'subscription', label: 'Subscription' },
    { id: 'general', label: 'General' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'data', label: 'Data Management' }
  ]

  const router = useRouter()
  const [user, setUser] = useState(authDb.getCurrentUser())
  const [subscription, setSubscription] = useState(user ? subscriptionDb.getByUserId(user.id) : null)
  
  useEffect(() => {
    const currentUser = authDb.getCurrentUser()
    setUser(currentUser)
    if (currentUser) {
      setSubscription(subscriptionDb.getByUserId(currentUser.id))
    }
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded border">
            <h2 className="text-lg font-semibold mb-4">Current Subscription</h2>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-lg">
                      {SUBSCRIPTION_PLANS.find(p => p.id === subscription.tier)?.name || subscription.tier} Plan
                    </div>
                    <div className="text-sm text-gray-500">
                      Status: <span className={subscription.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                        {subscription.status}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/subscription"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    {subscription.status === 'active' ? 'Change Plan' : 'Subscribe'}
                  </Link>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Current period: {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</div>
                  {subscription.cancelAtPeriodEnd && (
                    <div className="text-orange-600 mt-2">
                      Your subscription will be canceled at the end of the current billing period.
                    </div>
                  )}
                </div>
                {getPlan(subscription.tier) && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Plan Limits</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600">Projects:</div>
                      <div>{getPlan(subscription.tier)?.limits.maxProjects === -1 ? 'Unlimited' : getPlan(subscription.tier)?.limits.maxProjects}</div>
                      <div className="text-gray-600">Workers:</div>
                      <div>{getPlan(subscription.tier)?.limits.maxWorkers === -1 ? 'Unlimited' : getPlan(subscription.tier)?.limits.maxWorkers}</div>
                      <div className="text-gray-600">Inventory Items:</div>
                      <div>{getPlan(subscription.tier)?.limits.maxInventoryItems === -1 ? 'Unlimited' : getPlan(subscription.tier)?.limits.maxInventoryItems}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">No active subscription</div>
                <Link
                  href="/subscription"
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 inline-block"
                >
                  Subscribe Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded border">
            <h2 className="text-lg font-semibold mb-4">Regional Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="THB">THB - Thai Baht</option>
                  <option value="KHR">KHR - Cambodian Riel</option>
                  <option value="VND">VND - Vietnamese Dong</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                  <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                  <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (UTC+7)</option>
                  <option value="Asia/Phnom_Penh">Asia/Phnom Penh (UTC+7)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New York (UTC-5)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="en">English</option>
                  <option value="th">Thai</option>
                  <option value="kh">Khmer</option>
                  <option value="vi">Vietnamese</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <h2 className="text-lg font-semibold mb-4">Default Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Default Project View</label>
                <select
                  value={settings.defaultProjectView}
                  onChange={(e) => setSettings({ ...settings, defaultProjectView: e.target.value as 'grid' | 'list' })}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="grid">Grid View</option>
                  <option value="list">List View</option>
                </select>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Auto-save changes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.compactMode}
                  onChange={(e) => setSettings({ ...settings, compactMode: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Compact mode (smaller spacing)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-4 rounded border">
          <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-gray-500">Receive notifications via email</div>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-5 h-5"
              />
            </label>
            <label className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">Push Notifications</div>
                <div className="text-sm text-gray-500">Receive browser push notifications</div>
              </div>
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                className="w-5 h-5"
              />
            </label>
            <label className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">Daily Summary</div>
                <div className="text-sm text-gray-500">Get daily project summary</div>
              </div>
              <input
                type="checkbox"
                checked={settings.dailySummary}
                onChange={(e) => setSettings({ ...settings, dailySummary: e.target.checked })}
                className="w-5 h-5"
              />
            </label>
            <label className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">Weekly Report</div>
                <div className="text-sm text-gray-500">Receive weekly progress report</div>
              </div>
              <input
                type="checkbox"
                checked={settings.weeklyReport}
                onChange={(e) => setSettings({ ...settings, weeklyReport: e.target.checked })}
                className="w-5 h-5"
              />
            </label>
          </div>
        </div>
      )}

      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <div className="bg-white p-4 rounded border">
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <div className="grid grid-cols-3 gap-4">
                {(['light', 'dark', 'system'] as const).map(theme => (
                  <button
                    key={theme}
                    onClick={() => setSettings({ ...settings, theme })}
                    className={`p-4 border rounded-lg text-center ${
                      settings.theme === theme
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-lg mb-1">
                      {theme === 'light' && '☀️'}
                      {theme === 'dark' && '🌙'}
                      {theme === 'system' && '💻'}
                    </div>
                    <div className="capitalize">{theme}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Management */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded border">
            <h2 className="text-lg font-semibold mb-4">Export & Import Data</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded">
                <h3 className="font-medium mb-2">Export Data</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Download all your data as a JSON file for backup or transfer.
                </p>
                <button
                  onClick={handleExportData}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Export All Data
                </button>
              </div>
              <div className="p-4 bg-green-50 rounded">
                <h3 className="font-medium mb-2">Import Data</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Restore data from a previous backup file.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border border-red-200">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h2>
            <div className="p-4 bg-red-50 rounded">
              <h3 className="font-medium mb-2">Clear All Data</h3>
              <p className="text-sm text-gray-600 mb-3">
                Permanently delete all projects, workers, inventory, and profile data. This action cannot be undone.
              </p>
              <button
                onClick={handleClearData}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Save Settings
        </button>
        {saved && (
          <span className="text-green-600 font-medium">✓ Settings saved successfully!</span>
        )}
      </div>

      {/* Copyright Footer */}
      <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
        <p>© 2026 BEE-TRUST ENGINEERING CO, LTD. All rights reserved.</p>
        <p className="text-xs mt-1">Construction Pro - Construction Management System</p>
      </div>
    </div>
  )
}