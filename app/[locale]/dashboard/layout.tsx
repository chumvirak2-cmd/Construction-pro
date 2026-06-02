'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import NotificationBell from '../../components/NotificationBell'
import { authDb, demoDb } from '../../lib/db'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = pathname?.split('/')?.[1] || 'en'

  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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

  useEffect(() => {
    setIsReady(true)
  }, [])

  useEffect(() => {
    const routes = departments.flatMap((d) => d.items.map((i) => `/${currentLocale}${i.href}`))
      .concat(utilityItems.map((item) => `/${currentLocale}${item.href}`))

    routes.forEach((href) => {
      try {
        router.prefetch(href)
      } catch {
        // Ignore prefetch errors in development
      }
    })
  }, [currentLocale, router])

  const departments = [
    {
      title: 'Projects',
      items: [
        { title: 'Projects', href: '/dashboard/projects' },
        { title: 'New Project', href: '/dashboard/projects/new' },
        { title: 'Reports', href: '/dashboard/projects/reports' }
      ]
    },
    {
      title: 'Workers',
      items: [
        { title: 'Workers', href: '/dashboard/workers' },
        { title: 'Attendance', href: '/dashboard/worker' },
        { title: 'Tracking', href: '/dashboard/workers/tracking' }
      ]
    },
    {
      title: 'Inventory',
      items: [
        { title: 'Inventory', href: '/dashboard/inventory' },
        { title: 'Stock', href: '/dashboard/inventory/stock' },
        { title: 'Purchase Orders', href: '/dashboard/inventory/purchase' }
      ]
    },
    {
      title: 'BOQ',
      items: [
        { title: 'BOQ', href: '/dashboard/boq' },
        { title: 'Upload', href: '/dashboard/boq/upload' },
        { title: 'Summary', href: '/dashboard/boq/summary' }
      ]
    }
  ]

  const utilityItems = [
    { title: 'Settings', href: '/dashboard/settings' },
    { title: 'Logout', action: 'logout', redirect: `/${currentLocale}` }
  ]

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 bg-[#202951] text-white border-r border-[#14228D] hidden md:block">
        <div className="p-6 border-b border-[#14228D]">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-20 w-20 overflow-hidden rounded-3xl border border-white bg-[#CED3F4] shadow-lg">
              <img src="/logo.png" alt="Construction Pro logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">Construction Pro</p>
              <p className="text-sm text-white/80">AI Agentic</p>
            </div>
          </div>
        </div>
        <nav className="space-y-3 p-4">
          {departments.map((d) => (
            <div key={d.title} className="rounded-3xl bg-green-900/95 p-3 shadow-inner shadow-black/10">
              <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-green-200 mb-3">{d.title}</h3>
              <div className="space-y-2">
                {d.items.map((i) => {
                  const href = `/${currentLocale}${i.href}`
                  return (
                    <Link
                      key={i.href}
                      href={href}
                      className={`block rounded-2xl px-3 py-2 text-sm transition ${pathname === href ? 'bg-green-700 text-white font-semibold' : 'bg-green-950/40 text-green-100 hover:bg-green-800 hover:text-white'}`}
                    >
                      {i.title}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
          <div className="rounded-3xl bg-green-900/95 p-3 shadow-inner shadow-black/10">
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-green-200 mb-3">More</h3>
            <div className="space-y-2">
              {utilityItems.map((item) => {
                if (item.action === 'logout') {
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => {
                        authDb.logout()
                        demoDb.disableDemoMode()
                        router.push(item.redirect!)
                      }}
                      className="w-full rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-[#1C2CBA] transition hover:bg-slate-100"
                    >
                      {item.title}
                    </button>
                  )
                }

                const href = `/${currentLocale}${item.href}`
                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={`block rounded-2xl px-3 py-2 text-sm transition ${pathname === href ? 'bg-green-700 text-white font-semibold' : 'bg-green-950/40 text-green-100 hover:bg-green-800 hover:text-white'}`}
                  >
                    {item.title}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3" ref={ref}>
            <button className="md:hidden mr-2" onClick={() => setMenuOpen(!menuOpen)}>Menu</button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-2xl border border-green-500 bg-white">
                <img src="/logo.png" alt="Construction Pro logo" className="h-full w-full object-cover" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold">Construction Pro</h1>
                <p className="text-xs text-green-700">AI Agentic</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <NotificationBell />
          </div>
        </header>

        {isMobile && menuOpen && (
          <div className="md:hidden bg-[#1C2CBA] border-b border-[#14228D]">
            <nav className="p-4 space-y-3">
              {departments.map((department) => (
                <div key={department.title} className="rounded-3xl bg-green-900/95 p-3">
                  <p className="text-xs font-semibold uppercase text-green-200 tracking-wide mb-2">{department.title}</p>
                  <div className="space-y-2">
                    {department.items.map((item) => {
                      const href = `/${currentLocale}${item.href}`
                      return (
                        <Link
                          key={item.href}
                          href={href}
                          className={`block rounded-2xl px-3 py-2 text-sm transition ${pathname === href ? 'bg-green-700 text-white font-semibold' : 'bg-green-950/40 text-green-100 hover:bg-green-800 hover:text-white'}`}
                        >
                          {item.title}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
              <div className="rounded-3xl bg-green-900/95 p-3">
                <p className="text-xs font-semibold uppercase text-green-200 tracking-wide mb-2">More</p>
                <div className="space-y-2">
                  {utilityItems.map((item) => {
                    if (item.action === 'logout') {
                      return (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => {
                            authDb.logout()
                            demoDb.disableDemoMode()
                            router.push(item.redirect!)
                          }}
                          className="w-full rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-[#1C2CBA] transition hover:bg-slate-100"
                        >
                          {item.title}
                        </button>
                      )
                    }

                    const href = `/${currentLocale}${item.href}`
                    return (
                      <Link
                        key={item.href}
                        href={href}
                        className={`block rounded-2xl px-3 py-2 text-sm transition ${pathname === href ? 'bg-green-700 text-white font-semibold' : 'bg-green-950/40 text-green-100 hover:bg-green-800 hover:text-white'}`}
                      >
                        {item.title}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </nav>
          </div>
        )}

        <main className="p-4">{children}</main>
      </div>
    </div>
  )
}
