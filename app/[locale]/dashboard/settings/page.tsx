'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { authDb, subscriptionDb, SUBSCRIPTION_PLANS, getPlan } from '../../../lib/db'

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
  const locale = useLocale()
  const localizePath = (href: string) => `/${locale}${href}`
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('constructionProSettings')
      if (stored) {
        try {
          return { ...defaultSettings, ...JSON.parse(stored) }
        } catch {
          // ignore invalid stored data
        }
      }
    }
    return defaultSettings
  })
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

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
        alert('✅ Data imported successfully!')
      } catch {
        alert('❌ Failed to import data. Invalid file format.')
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
      alert('🗑️ All data has been cleared.')
    }
  }

  const tabs = [
    { id: 'subscription', label: 'Subscription', icon: '💳' },
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'data', label: 'Data', icon: '💾' }
  ]

  const router = useRouter()
  const [user] = useState(authDb.getCurrentUser())
  const [subscription] = useState(user ? subscriptionDb.getByUserId(user.id) : null)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm md:text-base mt-1">Manage your account and application preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1.5 bg-slate-100/80 rounded-2xl w-full overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="glass-card p-6 md:p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Current Subscription</h2>
          {subscription ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-5 bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-2xl border border-blue-100">
                <div>
                  <div className="font-bold text-xl text-slate-900 mb-1">
                    {SUBSCRIPTION_PLANS.find(p => p.id === subscription.tier)?.name || subscription.tier} Plan
                  </div>
                  <div className="text-sm text-slate-600">
                    Status:{' '}
                    <span className={subscription.status === 'active' ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                      {subscription.status}
                    </span>
                  </div>
                </div>
                <Link
                  href={localizePath('/subscription')}
                  className="gradient-btn-primary px-5 py-2.5 font-medium min-h-[44px]"
                >
                  {subscription.status === 'active' ? 'Change Plan' : 'Subscribe'}
                </Link>
              </div>
              
              <div className="text-sm text-slate-600">
                <div className="mb-2">
                  Current period: {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </div>
                {subscription.cancelAtPeriodEnd && (
                  <div className="text-amber-600 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    Your subscription will be canceled at the end of the current billing period.
                  </div>
                )}
              </div>

              {getPlan(subscription.tier) && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Plan Limits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
                      <div className="text-slate-500 text-xs mb-1">Projects</div>
                      <div className="font-bold text-slate-900">
                        {getPlan(subscription.tier)?.limits.maxProjects === -1 ? '∞ Unlimited' : getPlan(subscription.tier)?.limits.maxProjects}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
                      <div className="text-slate-500 text-xs mb-1">Workers</div>
                      <div className="font-bold text-slate-900">
                        {getPlan(subscription.tier)?.limits.maxWorkers === -1 ? '∞ Unlimited' : getPlan(subscription.tier)?.limits.maxWorkers}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
                      <div className="text-slate-500 text-xs mb-1">Inventory Items</div>
                      <div className="font-bold text-slate-900">
                        {getPlan(subscription.tier)?.limits.maxInventoryItems === -1 ? '∞ Unlimited' : getPlan(subscription.tier)?.limits.maxInventoryItems}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💳</span>
              </div>
              <p className="text-slate-500 mb-4">No active subscription</p>
              <Link
                href={localizePath('/subscription')}
                className="gradient-btn-primary px-6 py-2.5 font-medium inline-block"
              >
                Subscribe Now
              </Link>
            </div>
          )}
        </div>
      )}

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Regional Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="input-modern"
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="input-modern"
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="input-modern"
                >
                  <option value="en">English</option>
                  <option value="th">Thai</option>
                  <option value="kh">Khmer</option>
                  <option value="vi">Vietnamese</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Default Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Default Project View</label>
                <select
                  value={settings.defaultProjectView}
                  onChange={(e) => setSettings({ ...settings, defaultProjectView: e.target.value as 'grid' | 'list' })}
                  className="input-modern md:w-64"
                >
                  <option value="grid">Grid View</option>
                  <option value="list">List View</option>
                </select>
              </div>
              
              <div className="space-y-3">
                {[
                  { key: 'autoSave', label: 'Auto-save changes', desc: 'Automatically save your changes' },
                  { key: 'compactMode', label: 'Compact mode', desc: 'Smaller spacing and tighter layout' }
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div>
                      <div className="font-medium text-slate-900">{item.label}</div>
                      <div className="text-sm text-slate-600">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings[item.key as keyof AppSettings] as boolean}
                      onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                      className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/30"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="glass-card p-6 md:p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Notification Preferences</h2>
          <div className="space-y-3">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive browser push notifications' },
              { key: 'dailySummary', label: 'Daily Summary', desc: 'Get daily project summary' },
              { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive weekly progress report' }
            ].map(item => (
              <label key={item.key} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <div className="font-medium text-slate-900">{item.label}</div>
                  <div className="text-sm text-slate-600">{item.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof AppSettings] as boolean}
                  onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                  className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/30"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <div className="glass-card p-6 md:p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Appearance</h2>
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'light', icon: '☀️', label: 'Light', desc: 'Clean & bright' },
                { value: 'dark', icon: '🌙', label: 'Dark', desc: 'Easy on eyes' },
                { value: 'system', icon: '💻', label: 'System', desc: 'Match device' }
              ].map(theme => (
                <button
                  key={theme.value}
                  onClick={() => setSettings({ ...settings, theme: theme.value as 'light' | 'dark' | 'system' })}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-200 min-h-[120px] ${
                    settings.theme === theme.value
                      ? 'border-blue-300 bg-blue-50/50'
                      : 'border-slate-200 bg-slate-50/30 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">{theme.icon}</span>
                  <div>
                    <div className="font-semibold text-slate-900">{theme.label}</div>
                    <div className="text-xs text-slate-600">{theme.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Management */}
      {activeTab === 'data' && (
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Export & Import Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-blue-50/80 rounded-2xl border border-blue-200">
                <h3 className="font-semibold text-slate-900 mb-2">Export Data</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Download all your data as a JSON file for backup or transfer.
                </p>
                <button
                  onClick={handleExportData}
                  className="w-full gradient-btn-primary py-2.5 font-medium"
                >
                  Export All Data
                </button>
              </div>
              <div className="p-5 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                <h3 className="font-semibold text-slate-900 mb-2">Import Data</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Restore data from a previous backup file.
                </p>
                <label className="block">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                  <span className="w-full gradient-btn-secondary py-2.5 font-medium cursor-pointer inline-block text-center">
                    Choose File
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
            <div className="p-5 bg-red-50/80 rounded-2xl border border-red-200">
              <h3 className="font-semibold text-slate-900 mb-2">Clear All Data</h3>
              <p className="text-sm text-slate-600 mb-4">
                Permanently delete all projects, workers, inventory, and profile data. This action cannot be undone.
              </p>
              <button
                onClick={handleClearData}
                className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-500/25"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="gradient-btn-primary px-6 py-2.5 font-semibold min-h-[44px]"
        >
          Save Settings
        </button>
        {saved && (
          <span className="text-emerald-600 font-medium animate-fade-in">✓ Settings saved successfully!</span>
        )}
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
        <p>&copy; 2026 BEE-TRUST ENGINEERING CO, LTD. All rights reserved.</p>
        <p className="text-xs mt-1">Construction Pro - Construction Management System</p>
      </div>
    </div>
  )
}