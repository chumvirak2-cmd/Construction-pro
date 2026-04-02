'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
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

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: '🏠' },
    { href: '/dashboard/projects', label: 'Projects', icon: '📋' },
    { href: '/dashboard/workers', label: 'Workers', icon: '👷' },
    { href: '/dashboard/inventory', label: 'Inventory', icon: '📦' },
    { href: '/dashboard/boq', label: 'BOQ', icon: '🧮' },
  ]

  // Mobile Bottom Navigation
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Mobile Header */}
        <header className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full" />
            <span className="font-bold text-sm">Construction Pro</span>
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-2xl leading-none"
          >
            ☰
          </button>
        </header>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="absolute top-14 left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-50">
            <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700 border-b border-gray-100" onClick={() => setMenuOpen(false)}>
              <span>👤</span> Company Profile
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700 border-b border-gray-100" onClick={() => setMenuOpen(false)}>
              <span>⚙️</span> Settings
            </Link>
            <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-red-500 w-full text-left">
              <span>🚪</span> Logout
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto pb-16">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="flex justify-around items-center h-14">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center flex-1 h-full ${isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-[10px] mt-0.5">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    )
  }

  const desktopNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/dashboard/profile', label: 'Company Profile', icon: '👤' },
    { href: '/dashboard/projects', label: 'Projects', icon: '📋' },
    { href: '/dashboard/workers', label: 'Workers', icon: '👷' },
    { href: '/dashboard/inventory', label: 'Inventory', icon: '📦' },
    { href: '/dashboard/boq', label: 'BOQ Calculator', icon: '🧮' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ]

  // Desktop Sidebar Layout
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white relative flex flex-col flex-shrink-0">
        <div className="p-5 flex flex-col items-center text-center border-b border-gray-700">
          <Link href="/dashboard" className="flex flex-col items-center">
            <img src="/logo.png" alt="Construction Pro" className="w-24 h-24 rounded-full mb-2" />
            <div className="font-bold text-lg">Construction Pro</div>
            <div className="text-xs text-gray-400">AI Agent</div>
          </Link>
        </div>
        <nav className="flex-1 mt-4 px-2">
          <ul className="space-y-1">
            {desktopNavItems.map((item) => {
              const isActive = item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
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
