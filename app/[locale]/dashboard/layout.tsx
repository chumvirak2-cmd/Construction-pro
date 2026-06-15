'use client'

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import NotificationBell from '../../components/NotificationBell'

const MEP_GROUPS = [
  {
    title: 'Electrical & Power',
    items: [
      { title: 'Electrical Systems', href: '/dashboard/mep/electrical', icon: '⚡' },
      { title: 'Solar / Energy', href: '/dashboard/mep/solar-energy', icon: '☀️' }
    ]
  },
  {
    title: 'Climate & Comfort',
    items: [
      { title: 'HVAC Systems', href: '/dashboard/mep/hvac', icon: '❄️' },
      { title: 'Plumbing Systems', href: '/dashboard/mep/plumbing', icon: '🚿' }
    ]
  },
  {
    title: 'Communications & Safety',
    items: [
      { title: 'ELV Systems', href: '/dashboard/mep/elv', icon: '📡' },
      { title: 'Fire Protection', href: '/dashboard/mep/fire-protection', icon: '🔥' },
      { title: 'Gas Systems', href: '/dashboard/mep/gas-system', icon: '⛽' }
    ]
  },
  {
    title: 'Specialized Lifts',
    items: [
      { title: 'Lift / Escalator', href: '/dashboard/mep/lift-escalator', icon: '🛗' },
      { title: 'BMS / Controls', href: '/dashboard/mep/bms-controls', icon: '🎛️' }
    ]
  }
]

const DEPARTMENTS = [
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
    title: 'MEP Systems',
    items: [],
    isGroup: true,
    groups: MEP_GROUPS
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

const SidebarIcon = ({ icon }: { icon: string }) => (
  <span className="text-base leading-none flex-shrink-0">{icon}</span>
)

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const MEP_SUBITEMS: Record<string, { title: string; href: string; icon: string }[]> = {
  'Electrical & Power': [
    { title: 'Electrical Systems', href: '/dashboard/mep/electrical', icon: '⚡' },
    { title: 'Solar / Energy', href: '/dashboard/mep/solar-energy', icon: '☀️' }
  ],
  'Climate & Comfort': [
    { title: 'HVAC Systems', href: '/dashboard/mep/hvac', icon: '❄️' },
    { title: 'Plumbing Systems', href: '/dashboard/mep/plumbing', icon: '🚿' }
  ],
  'Communications & Safety': [
    { title: 'ELV Systems', href: '/dashboard/mep/elv', icon: '📡' },
    { title: 'Fire Protection', href: '/dashboard/mep/fire-protection', icon: '🔥' },
    { title: 'Gas Systems', href: '/dashboard/mep/gas-system', icon: '⛽' }
  ],
  'Specialized Lifts': [
    { title: 'Lift / Escalator', href: '/dashboard/mep/lift-escalator', icon: '🛗' },
    { title: 'BMS / Controls', href: '/dashboard/mep/bms-controls', icon: '🎛️' }
  ]
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = pathname?.split('/')?.[1] || 'en'

  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mepOpen, setMepOpen] = useState(true)

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) setMenuOpen(false)
    }
    handleResize()
    let timeoutId: number
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = window.setTimeout(handleResize, 100)
    }
    window.addEventListener('resize', debouncedResize)
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      ;(window as any).requestIdleCallback(() => {
        const utilityItems = [
          { title: 'Settings', href: '/dashboard/settings' },
          { title: 'Logout', action: 'logout', redirect: `/${currentLocale}` }
        ]
        const allHrefs = DEPARTMENTS.flatMap((d) => {
          if (d.isGroup && d.groups) {
            return d.groups.flatMap((g) => g.items.map((i) => `/${currentLocale}${i.href}`))
          }
          return d.items.map((i) => `/${currentLocale}${i.href}`)
        }).concat(
          utilityItems.filter((u) => u.href).map((item) => `/${currentLocale}${(item as any).href}`)
        )
        allHrefs.forEach((href) => router.prefetch(href))
      }, { timeout: 2000 })
    }
  }, [currentLocale, router])

  const utilityItems = useMemo(() => [
    { title: 'Settings', href: '/dashboard/settings' },
    { title: 'Logout', action: 'logout', redirect: `/${currentLocale}` }
  ], [currentLocale])

  const handleLogout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cp_current_user')
      localStorage.removeItem('cp_demo_mode')
    }
  }, [])

  return (
    <div className="min-h-screen flex bg-construction-50/50">
      <aside className={`
        fixed md:sticky top-0 h-screen z-40
        bg-construction-900 text-white
        transition-all duration-300 ease-out
        ${isMobile && !menuOpen ? '-translate-x-full' : 'translate-x-0'}
        ${sidebarCollapsed && !isMobile ? 'w-20' : 'w-72'}
        md:translate-x-0
        shadow-2xl shadow-construction-900/50
      `}>
        <div className="h-full flex flex-col">
          <div className="p-5 border-b border-white/10">
            <div className={`flex items-center gap-4 ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}`}>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-blue-500/30 rounded-2xl blur-lg" />
                <div className="relative h-12 w-12 overflow-hidden rounded-2xl border-2 border-white/20 bg-construction-800 shadow-lg">
                  <img 
                    src="/logo.png" 
                    alt="Construction Pro" 
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.src = '/logo-placeholder.png' }}
                  />
                </div>
              </div>
              {(!sidebarCollapsed || isMobile) && (
                <div className="animate-fade-in">
                  <p className="text-base font-bold text-white tracking-tight">Construction Pro</p>
                  <p className="text-xs text-white/60 font-medium">AI Agentic</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide">
            {DEPARTMENTS.map((d, dIndex) => (
              <div key={d.title} className="animate-fade-up" style={{ animationDelay: `${dIndex * 0.05}s` }}>
                {(!sidebarCollapsed || isMobile) && (
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3 px-2">
                    {d.title}
                  </h3>
                )}
                
                {d.isGroup && d.groups ? (
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setMepOpen(!mepOpen)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                        transition-all duration-200 text-white/70 hover:text-white hover:bg-white/10
                        ${sidebarCollapsed && !isMobile ? 'justify-center px-0' : ''}
                      `}
                      title={sidebarCollapsed && !isMobile ? 'MEP Systems' : undefined}
                    >
                      <ChevronIcon open={mepOpen} />
                      <span className="text-base">🏗️</span>
                      {(!sidebarCollapsed || isMobile) && <span className="truncate">{d.title}</span>}
                    </button>
                    
                    {mepOpen && !sidebarCollapsed && (
                      <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-white/10 pl-3 animate-fade-in">
                        {d.groups.map((group) => (
                          <div key={group.title} className="mb-2">
                            {(!sidebarCollapsed || isMobile) && (
                              <p className="text-[11px] font-semibold uppercase text-white/30 mb-1.5 tracking-wider">
                                {group.title}
                              </p>
                            )}
                            <div className="space-y-1">
                              {group.items.map((i) => {
                                const href = `/${currentLocale}${i.href}`
                                const isActive = pathname === href
                                return (
                                  <Link
                                    key={i.href}
                                    href={href}
                                    onClick={() => setMenuOpen(false)}
                                    className={`
                                      flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium
                                      transition-all duration-200 relative
                                      ${isActive 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
                                        : 'text-white/60 hover:text-white hover:bg-white/8'
                                      }
                                    `}
                                  >
                                    {isActive && (
                                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-white rounded-r-full" />
                                    )}
                                    <span className="text-sm">{i.icon || '📄'}</span>
                                    <span className="truncate">{i.title}</span>
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {mepOpen && sidebarCollapsed && !isMobile && (
                      <div className="flex flex-col items-center space-y-1.5 mt-1">
                        {d.groups.flatMap((g) => g.items).map((i) => {
                          const href = `/${currentLocale}${i.href}`
                          const isActive = pathname === href
                          return (
                            <Link
                              key={i.href}
                              href={href}
                              onClick={() => setMenuOpen(false)}
                              title={i.title}
                              className={`
                                w-10 h-10 flex items-center justify-center rounded-xl text-sm
                                transition-all duration-200 relative
                                ${isActive 
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
                                  : 'text-white/60 hover:text-white hover:bg-white/10'
                                }
                              `}
                            >
                              {i.icon || '📄'}
                              {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-white rounded-r-full" />
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`space-y-1.5 ${sidebarCollapsed && !isMobile ? 'flex flex-col items-center' : ''}`}>
                    {d.items.map((i) => {
                      const href = `/${currentLocale}${i.href}`
                      const isActive = pathname === href
                      return (
                        <Link
                          key={i.href}
                          href={href}
                          onClick={() => setMenuOpen(false)}
                          className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                            transition-all duration-200 group relative
                            ${isActive 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25' 
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                            }
                            ${sidebarCollapsed && !isMobile ? 'justify-center px-0' : ''}
                          `}
                          title={sidebarCollapsed && !isMobile ? i.title : undefined}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                          )}
                          {d.title === 'Projects' && <SidebarIcon icon="📋" />}
                          {d.title === 'Workers' && <span className="text-base">{i.title.includes('Track') ? '📍' : i.title.includes('Attendance') ? '⏰' : '👷'}</span>}
                          {d.title === 'Inventory' && <span className="text-base">{i.title.includes('Stock') ? '📊' : i.title.includes('Purchase') ? '🛒' : '📦'}</span>}
                          {d.title === 'BOQ' && <span className="text-base">{i.title.includes('Upload') ? '⬆️' : i.title.includes('Summary') ? '📊' : '📄'}</span>}
                          {(!sidebarCollapsed || isMobile) && <span className="truncate">{i.title}</span>}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-2 border-t border-white/10 animate-fade-up" style={{ animationDelay: '0.25s' }}>
              {(!sidebarCollapsed || isMobile) && (
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3 px-2">Account</h3>
              )}
              <div className={`space-y-1.5 ${sidebarCollapsed && !isMobile ? 'flex flex-col items-center' : ''}`}>
                <Link
                  href={`/${currentLocale}/dashboard/settings`}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200 text-white/70 hover:text-white hover:bg-white/10
                    ${sidebarCollapsed && !isMobile ? 'justify-center px-0' : ''}
                  `}
                  title={sidebarCollapsed && !isMobile ? 'Settings' : undefined}
                >
                  <span className="text-base">⚙️</span>
                  {(!sidebarCollapsed || isMobile) && <span>Settings</span>}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout()
                    router.push(`/${currentLocale}`)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                    transition-all duration-200 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white
                    ${sidebarCollapsed && !isMobile ? 'justify-center px-0' : ''}
                  `}
                  title={sidebarCollapsed && !isMobile ? 'Logout' : undefined}
                >
                  <span className="text-base">🚪</span>
                  {(!sidebarCollapsed || isMobile) && <span>Logout</span>}
                </button>
              </div>
            </div>
          </nav>

          {!isMobile && (
            <div className="p-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-all duration-200"
              >
                <span className="text-sm transition-transform duration-300" style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ◀
                </span>
                {!sidebarCollapsed && <span>Collapse</span>}
              </button>
            </div>
          )}
        </div>
      </aside>

      {isMobile && menuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 animate-fade-in md:hidden" onClick={() => setMenuOpen(false)} />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 shadow-sm shadow-black/2">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            <div className="flex items-center gap-3">
              <button 
                className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors" 
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg className="w-6 h-6 text-construction-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
              <Link href={isMobile ? `/${currentLocale}/dashboard` : '#'} className="flex items-center gap-3">
                <div className="h-9 w-9 overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">
                  <img src="/logo.png" alt="Construction Pro logo" className="h-full w-full object-cover" />
                </div>
                <div className="text-left hidden sm:block">
                  <h1 className="text-sm font-bold text-construction-800 tracking-tight">Construction Pro</h1>
                  <p className="text-xs text-blue-600 font-medium">AI Agentic</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
              <button className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-200 group">
                <span className="relative flex h-5 w-5">
                  <span className="absolute inset-0 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce-soft">3</span>
                </span>
                <svg className="w-5 h-5 text-construction-500 group-hover:text-construction-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button className="hidden md:flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                  A
                </div>
              </button>
            </div>
          </div>

          {isMobile && (
            <div className="px-4 pb-3 flex md:hidden">
              <LanguageSwitcher />
            </div>
          )}
        </header>

        {isMobile && menuOpen && (
          <div 
            ref={ref}
            className="fixed inset-x-0 top-16 bottom-0 z-30 bg-white/95 backdrop-blur-2xl overflow-y-auto shadow-2xl md:hidden animate-fade-in"
          >
            <nav className="p-4 space-y-5">
              {DEPARTMENTS.map((department, dIndex) => (
                <div key={department.title} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">{department.title}</p>
                  {department.isGroup && department.groups ? (
                    <div className="space-y-3">
                      {department.groups.map((group) => (
                        <div key={group.title}>
                          <p className="text-[11px] font-semibold uppercase text-slate-500 mb-1.5">{group.title}</p>
                          <div className="space-y-1">
                            {group.items.map((item) => {
                              const href = `/${currentLocale}${item.href}`
                              return (
                                <Link
                                  key={item.href}
                                  href={href}
                                  onClick={() => setMenuOpen(false)}
                                  className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                                    pathname === href 
                                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                                      : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                                  }`}
                                >
                                  <span className="mr-2">{item.icon}</span>
                                  {item.title}
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {department.items.map((item) => {
                        const href = `/${currentLocale}${item.href}`
                        return (
                          <Link
                            key={item.href}
                            href={href}
                            onClick={() => setMenuOpen(false)}
                            className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                              pathname === href 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                                : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                            }`}
                          >
                            {item.title}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Account</p>
                <div className="space-y-1.5">
                  <Link
                    href={`/${currentLocale}/dashboard/settings`}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all duration-200"
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout()
                      router.push(`/${currentLocale}`)
                    }}
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:shadow-sm transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
