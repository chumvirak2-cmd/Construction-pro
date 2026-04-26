'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { authDb, subscriptionDb, demoDb } from '../lib/db'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLLIElement | null>(null)

  const setDropdownRef = (element: HTMLLIElement | null) => {
    dropdownRef.current = element
  }

  useEffect(() => {
    setIsDemo(demoDb.isDemoMode())
  }, [])

  const handleLogout = () => {
    demoDb.disableDemoMode()
    localStorage.clear()
    sessionStorage.clear()
    router.push('/')
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const isDemo = demoDb.isDemoMode()
    const user = authDb.getCurrentUser()
    
    if (isDemo) {
      setIsReady(true)
      return
    }
    
    if (user) {
      const sub = subscriptionDb.getByUserId(user.id)
      setSubscription(sub)
      if (!sub || (sub.status !== 'active' && sub.status !== 'trialing')) {
        router.push('/subscription')
      } else {
        setIsReady(true)
      }
    } else {
      router.push('/')
    }
  }, [router])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDepartment(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  const canAddUsers = subscription?.tier === 'professional' || subscription?.tier === 'enterprise'

  // All MEP systems from types
  const mepSystems = [
    'HVAC',
    'Electrical',
    'Plumbing',
    'ELV',
    'Fire Protection',
    'Gas System',
    'Solar/Energy',
    'BMS/Controls',
    'Lift & Escalator'
  ]

  // Department navigation structure
  const departments = [
    {
      id: 'marketing',
      label: 'Marketing',
      icon: '📢',
      items: [
        { href: '/dashboard/marketing/campaigns', label: 'Campaigns' },
        { href: '/dashboard/marketing/analytics', label: 'Analytics' },
        { href: '/dashboard/marketing/leads', label: 'Leads' },
      ]
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: '💼',
      items: [
        { href: '/dashboard/sales/clients', label: 'Clients' },
        { href: '/dashboard/sales/deals', label: 'Deals' },
        { href: '/dashboard/sales/quotes', label: 'Quotations' },
        { href: '/dashboard/projects', label: 'Projects' },
      ]
    },
    {
      id: 'mep',
      label: 'MEP Systems',
      icon: '🔧',
      items: mepSystems.map(system => ({
        href: `/dashboard/mep/${system.toLowerCase().replace('/', '-').replace(' ', '-')}`,
        label: system
      }))
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: '🏗️',
      items: [
        { href: '/dashboard/projects', label: 'Projects' },
        { href: '/dashboard/workers', label: 'Workers' },
        { href: '/dashboard/inventory', label: 'Inventory' },
        { href: '/dashboard/boq', label: 'BOQ Calculator' },
        ...(canAddUsers ? [{ href: '/dashboard/users', label: 'Team Users' }] : []),
      ]
    }
  ]

  const utilityItems = [
    { href: '/dashboard/profile', label: 'Company Profile', icon: '👤' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ]

  const isActiveDepartment = (deptItems: { href: string }[]) => {
    return deptItems.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
  }

  // Mobile Bottom Navigation
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Mobile Header */}
        <header className="bg-gray-800 text-white px-3 py-3 flex items-center justify-between sticky top-0 z-50">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png?v=2" alt="Logo" className="w-7 h-7 rounded-full" />
            <span className="font-bold text-sm truncate">Construction Pro</span>
          </Link>
          <div className="flex items-center gap-2">
            {isDemo && <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">DEMO</span>}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white text-2xl leading-none p-1"
            >
              ☰
            </button>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="absolute top-14 left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-50 max-h-[70vh] overflow-y-auto">
            {departments.map(dept => (
              <div key={dept.id} className="border-b border-gray-100">
                <div className="flex items-center gap-2 px-4 py-3 font-medium text-gray-700">
                  <span>{dept.icon}</span> {dept.label}
                </div>
                <div className="bg-gray-50 px-4 pb-2">
                  {dept.items.map((item, idx) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
                          isActive ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
            {utilityItems.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700 border-b border-gray-100 ${isActive ? 'bg-blue-50 text-blue-600' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{item.icon}</span> {item.label}
                </Link>
              )
            })}
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-red-500 w-full text-left"
            >
              <span>🚪</span> Logout
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto pb-16">
          {children}
        </div>

        {/* Mobile Bottom Navigation - Department shortcuts */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-pb">
          <div className="flex justify-around items-center h-16">
            {departments.map((dept) => {
              const isActive = isActiveDepartment(dept.items)
              return (
                <Link
                  key={dept.id}
                  href={dept.items[0]?.href || '#'}
                  className={`flex flex-col items-center justify-center flex-1 h-full py-2 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
                >
                  <span className="text-xl">{dept.icon}</span>
                  <span className="text-[10px] mt-0.5">{dept.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    )
  }

  // Desktop Sidebar Layout
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white relative flex flex-col flex-shrink-0">
        <div className="p-5 flex flex-col items-center text-center border-b border-gray-700">
          <Link href="/dashboard" className="flex flex-col items-center">
            <img src="/logo.png?v=2" alt="Construction Pro" className="w-24 h-24 rounded-full mb-2" />
            <div className="font-bold text-lg">Construction Pro</div>
            <div className="text-xs text-gray-400">AI Agent</div>
            {isDemo && <span className="mt-1 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">DEMO MODE</span>}
          </Link>
        </div>
        <nav className="flex-1 mt-4 px-2">
          <ul className="space-y-1">
            {/* Dashboard Home */}
            <li>
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-gray-700 text-white font-medium'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-base">🏠</span>
                Dashboard
              </Link>
            </li>

            {/* Department Navigation with Dropdowns */}
            {departments.map(dept => {
              const isActive = isActiveDepartment(dept.items)
              const isDropdownOpen = activeDepartment === dept.id
              
              return (
                <li key={dept.id} className="relative" ref={isDropdownOpen ? setDropdownRef : undefined}>
                  <button
                    onClick={() => setActiveDepartment(isDropdownOpen ? null : dept.id)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-gray-700 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{dept.icon}</span>
                      {dept.label}
                    </div>
                    <span className={`text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {/* Department Submenu */}
                  {isDropdownOpen && (
                    <ul className="mt-1 ml-4 pl-4 border-l-2 border-gray-600 space-y-1">
                      {dept.items.map((item, idx) => {
                        const itemActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                          <li key={idx}>
                            <Link
                              href={item.href}
                              onClick={() => setActiveDepartment(null)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                itemActive
                                  ? 'bg-gray-700 text-white font-medium'
                                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                              }`}
                            >
                              {item.label}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}

            {/* Utility Items */}
            {utilityItems.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-gray-700 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              )
            })}

            {/* Logout */}
            <li className="border-t border-gray-700 mt-4 pt-3">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-700 text-red-400 flex items-center gap-3 text-sm transition-colors"
              >
                <span className="text-base">🚪</span> Logout
              </button>
            </li>
          </ul>
        </nav>
        {/* Copyright Footer */}
        <div className="p-4 text-xs text-gray-500 text-center border-t border-gray-700">
          <p>&copy; 2026 BEE-TRUST ENGINEERING</p>
          <p>All rights reserved.</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
