'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        {/* Main Content */}
        <div className="flex-1 overflow-auto pb-20">
          {children}
        </div>
        
        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center flex-1 h-full ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs mt-1">{item.label}</span>
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
      <div className="w-64 bg-gray-800 text-white relative flex flex-col">
        <div className="p-4">
          <Link href="/dashboard">
            <div className="font-bold text-xl">Construction Pro</div>
            <div className="text-xs text-gray-400">MEP ERP System</div>
          </Link>
        </div>
        <nav className="flex-1 mt-4">
          <ul>
            <li>
              <Link href="/dashboard/profile" className="block px-4 py-2 hover:bg-gray-700">
                Company Profile
              </Link>
            </li>
            <li>
              <Link href="/dashboard/projects" className="block px-4 py-2 hover:bg-gray-700">
                Projects
              </Link>
            </li>
            <li>
              <Link href="/dashboard/workers" className="block px-4 py-2 hover:bg-gray-700">
                Workers
              </Link>
            </li>
            <li>
              <Link href="/dashboard/inventory" className="block px-4 py-2 hover:bg-gray-700">
                Inventory
              </Link>
            </li>
            <li>
              <Link href="/dashboard/boq" className="block px-4 py-2 hover:bg-gray-700">
                BOQ Calculator
              </Link>
            </li>
            <li>
              <Link href="/dashboard/settings" className="block px-4 py-2 hover:bg-gray-700">
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        {/* Copyright Footer */}
        <div className="p-4 text-xs text-gray-400 text-center border-t border-gray-700">
          <p>© 2026 BEE-TRUST ENGINEERING</p>
          <p>All rights reserved.</p>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        {children}
      </div>
    </div>
  )
}
