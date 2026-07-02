'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

type MenuItem = {
  title: string
  href?: string
  subItems?: { title: string; href: string }[]
}

const MENU_ITEMS: MenuItem[] = [
  { title: 'Projects', href: '/dashboard/projects/' },
  { title: 'Workers', href: '/dashboard/workers/' },
  { title: 'Inventory', href: '/dashboard/inventory/' },
  { title: 'BOQ', href: '/dashboard/boq/' },
  {
    title: 'MEP',
    href: '/dashboard/mep/hvac',
    subItems: [
      { title: 'HVAC', href: '/dashboard/mep/hvac' },
      { title: 'Electrical', href: '/dashboard/mep/electrical' },
      { title: 'Plumbing', href: '/dashboard/mep/plumbing' },
      { title: 'ELV', href: '/dashboard/mep/elv' },
      { title: 'Fire Protection', href: '/dashboard/mep/fire-protection' },
      { title: 'Gas System', href: '/dashboard/mep/gas-system' },
      { title: 'Solar / Energy', href: '/dashboard/mep/solar-energy' },
      { title: 'BMS / Controls', href: '/dashboard/mep/bms-controls' },
      { title: 'Lift & Escalator', href: '/dashboard/mep/lift-escalator' },
    ],
  },
  { title: 'Settings', href: '/dashboard/settings/' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = pathname?.split('/')?.[1] || 'en'
  const [menuOpen, setMenuOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('cp_current_user')
    localStorage.removeItem('cp_demo_mode')
    router.push(`/${currentLocale}`)
  }

  const isActive = (href?: string) => (href ? pathname?.includes(href) : false)

  useEffect(() => {
    setExpandedMenus((current) => {
      const next = { ...current }
      MENU_ITEMS.forEach((item) => {
        if (item.subItems?.some((subItem) => pathname?.includes(subItem.href))) {
          next[item.title] = true
        }
      })
      return next
    })
  }, [pathname])

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="hidden md:block w-64 bg-slate-800 text-white min-h-screen">
        <div className="p-4">
          <div className="flex flex-col items-center mb-4">
            <img src="/logo.png?v=2" alt="Construction Pro" className="w-16 h-16 rounded-lg bg-white/10 p-1" />
            <h2 className="text-lg font-bold mt-2">Construction Pro</h2>
          </div>
          <nav className="space-y-2">
            {MENU_ITEMS.map((item) => (
              <div key={item.title}>
                {item.subItems ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setExpandedMenus((prev) => ({ ...prev, [item.title]: !prev[item.title] }))}
                      className={`flex w-full items-center justify-between px-3 py-2 rounded hover:bg-slate-700 ${isActive(item.href) || item.subItems.some((sub) => isActive(sub.href)) ? 'bg-slate-700' : ''}`}
                    >
                      <span>{item.title}</span>
                      <span className="text-slate-300">{expandedMenus[item.title] ? '−' : '+'}</span>
                    </button>
                    {expandedMenus[item.title] && (
                      <div className="space-y-1 px-3">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={`/${currentLocale}${subItem.href}`}
                            className={`block rounded px-3 py-2 text-sm hover:bg-slate-700 ${isActive(subItem.href) ? 'bg-slate-700 text-white' : 'text-slate-300'}`}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/${currentLocale}${item.href}`}
                    className={`block px-3 py-2 rounded hover:bg-slate-700 ${isActive(item.href) ? 'bg-slate-700' : ''}`}
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
            <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded hover:bg-slate-700 mt-4">
              Logout
            </button>
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 p-4 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png?v=2" alt="Construction Pro" className="w-9 h-9 rounded-lg bg-slate-100 p-1" />
              <span className="font-semibold text-slate-900">Construction Pro</span>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>

      {menuOpen && (
        <div ref={ref} className="fixed inset-0 z-40 bg-white md:hidden">
          <nav className="p-4 space-y-2">
            {MENU_ITEMS.map((item) => (
              <div key={item.title}>
                {item.subItems ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setExpandedMenus((prev) => ({ ...prev, [item.title]: !prev[item.title] }))}
                      className="flex w-full items-center justify-between px-3 py-2 rounded hover:bg-gray-100"
                    >
                      <span>{item.title}</span>
                      <span>{expandedMenus[item.title] ? '−' : '+'}</span>
                    </button>
                    {expandedMenus[item.title] && (
                      <div className="space-y-1 pl-4">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={`/${currentLocale}${subItem.href}`}
                            onClick={() => setMenuOpen(false)}
                            className={`block rounded px-3 py-2 text-sm hover:bg-gray-100 ${isActive(subItem.href) ? 'bg-gray-100 font-semibold' : ''}`}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/${currentLocale}${item.href}`}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2 rounded hover:bg-gray-100 ${isActive(item.href) ? 'bg-gray-100 font-semibold' : ''}`}
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
            <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100">
              Logout
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}