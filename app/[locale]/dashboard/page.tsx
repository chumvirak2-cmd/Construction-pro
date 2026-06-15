'use client'

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import React from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { projectsDb, workersDb, inventoryDb, boqDb } from '../../lib/db'
import type { Project, Worker, InventoryItem, BOQ, DashboardStats } from '../../types'

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse space-y-2">
        <div className="h-8 w-52 bg-slate-200 rounded-xl" />
        <div className="h-4 w-72 bg-slate-100 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 loader-shimmer h-36" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 loader-shimmer h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 loader-shimmer h-48" />
        ))}
      </div>
    </div>
  )
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: unknown) {
    console.error('Dashboard render error:', error)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center text-red-600 bg-red-50 rounded-2xl border border-red-100">
          Something went wrong loading the dashboard.
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function DashboardContent() {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const localizePath = useCallback((href: string) => `/${locale}${href}`, [locale])
  const [isLoading, setIsLoading] = useState(true)
  const [boqs, setBoqs] = useState<BOQ[]>([])
  const [boqsLoading, setBoqsLoading] = useState(true)

  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalWorkers: 0,
    activeWorkers: 0,
    totalInventory: 0,
    lowStockItems: 0,
    totalRevenue: 0,
    monthlyExpenses: 0
  })
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [recentWorkers, setRecentWorkers] = useState<Worker[]>([])
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])

  useEffect(() => {
    let cancelled = false
    const t0 = performance.now()
    queueMicrotask(() => {
      try {
        const projects = projectsDb.getAll()
        const workers = workersDb.getAll()
        const inventory = inventoryDb.getAll()

        if (cancelled) return

        setStats({
          totalProjects: projects.length,
          activeProjects: projects.filter((p) => p.status === 'in_progress').length,
          completedProjects: projects.filter((p) => p.status === 'completed').length,
          totalWorkers: workers.length,
          activeWorkers: workers.filter((w) => w.status === 'active').length,
          totalInventory: inventory.length,
          lowStockItems: inventory.filter((i) => i.minQuantity > 0 && i.quantity < i.minQuantity).length,
          totalRevenue: projects.reduce((sum, p) => sum + p.budget, 0),
          monthlyExpenses: workers.reduce((sum, w) => sum + (w.dailyRate * 26), 0)
        })

        setRecentProjects(projects.slice(-5).reverse())
        setRecentWorkers(workers.slice(-5).reverse())
        setLowStockItems(
          inventory
            .filter((i) => i.minQuantity > 0 && i.quantity < i.minQuantity)
            .slice(0, 5)
        )
        setIsLoading(false)

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          ;(window as any).requestIdleCallback(() => {
            if (cancelled) return
            setBoqs(boqDb.getAll().slice(-5).reverse())
            setBoqsLoading(false)
          }, { timeout: 800 })
        } else {
          setBoqs(boqDb.getAll().slice(-5).reverse())
          setBoqsLoading(false)
        }
      } catch (err) {
        console.error('Dashboard init error:', err)
        setIsLoading(false)
        setBoqsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const formatCurrency = useCallback((amount: number) => {
    if (!amount && amount !== 0) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }, [])

  const statCards = useMemo(
    () => [
      {
        title: t('stats.projects.title'),
        value: stats.totalProjects,
        icon: '📋',
        gradient: 'from-blue-500 to-blue-600',
        subtleBg: 'bg-blue-50',
        border: 'border-blue-200',
        link: localizePath('/dashboard/projects'),
        label: t('stats.projects.label'),
        subtext: `${stats.activeProjects} active · ${stats.completedProjects} done`,
        progress: stats.totalProjects > 0 ? Math.round((stats.completedProjects / Math.max(stats.totalProjects, 1)) * 100) : 0
      },
      {
        title: t('stats.workers.title'),
        value: stats.totalWorkers,
        icon: '👷',
        gradient: 'from-emerald-500 to-teal-600',
        subtleBg: 'bg-emerald-50',
        border: 'border-emerald-200',
        link: localizePath('/dashboard/workers'),
        label: t('stats.workers.label'),
        subtext: `${stats.activeWorkers} active`,
        progress: stats.totalWorkers > 0 ? Math.round((stats.activeWorkers / stats.totalWorkers) * 100) : 0
      },
      {
        title: t('stats.inventory.title'),
        value: stats.totalInventory,
        icon: '📦',
        gradient: 'from-orange-500 to-amber-600',
        subtleBg: 'bg-orange-50',
        border: 'border-orange-200',
        link: localizePath('/dashboard/inventory'),
        label: t('stats.inventory.label'),
        subtext: `${stats.lowStockItems} low stock`,
        progress: stats.totalInventory > 0 ? Math.max(0, 100 - Math.round((stats.lowStockItems / Math.max(stats.totalInventory, 1)) * 100)) : 100
      },
      {
        title: t('stats.boq.title'),
        value: boqs.length,
        icon: '📄',
        gradient: 'from-violet-500 to-purple-600',
        subtleBg: 'bg-violet-50',
        border: 'border-violet-200',
        link: localizePath('/dashboard/boq'),
        label: t('stats.boq.label'),
        subtext: boqsLoading ? 'Loading...' : 'Bill of quantities',
        progress: 0
      }
    ],
    [stats, boqs, boqsLoading, t, localizePath]
  )

  const quickActions = useMemo(
    () => [
      { label: t('quickActions.addProject'), href: localizePath('/dashboard/projects/new'), icon: '✨', classes: 'bg-blue-50 text-blue-700 border border-blue-100' },
      { label: t('quickActions.addWorker'), href: localizePath('/dashboard/workers'), icon: '👤', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
      { label: t('quickActions.addInventory'), href: localizePath('/dashboard/inventory'), icon: '📥', classes: 'bg-orange-50 text-orange-700 border border-orange-100' },
      { label: t('quickActions.createBOQ'), href: localizePath('/dashboard/boq'), icon: '🧮', classes: 'bg-violet-50 text-violet-700 border border-violet-100' }
    ],
    [t, localizePath]
  )

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold text-construction-900 tracking-tight">
          {t('welcome.title')}
        </h1>
        <p className="text-construction-500 text-sm md:text-base">
          {t('welcome.subtitle')}
        </p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Key statistics">
        {statCards.map((card, index) => (
          <Link
            key={index}
            href={card.link}
            prefetch={false}
            className="group block animate-fade-up"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="relative bg-white rounded-2xl border border-slate-100 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-slate-200 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg shadow-slate-300/30 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className="text-xl">{card.icon}</span>
                  </div>
                  {card.progress > 0 && (
                    <span className="text-xs font-bold text-slate-400">{card.progress}%</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-construction-400 uppercase tracking-wider mb-1">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-construction-900 tracking-tight">{card.value}</p>
                <p className="text-xs text-construction-400 mt-1.5 font-medium">{card.subtext}</p>
                {card.progress > 0 && (
                  <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${card.gradient} transition-all duration-700`}
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Financial overview">
        {[
          { gradient: 'from-blue-500 to-blue-700', shadow: 'shadow-blue-500/20', title: t('financial.totalBudget'), value: formatCurrency(stats.totalRevenue), sub: `${stats.totalProjects} ${t('financial.projects')}`, accent: 'text-blue-200' },
          { gradient: 'from-emerald-500 to-teal-700', shadow: 'shadow-emerald-500/20', title: t('financial.monthlyLabor'), value: formatCurrency(stats.monthlyExpenses), sub: `${stats.activeWorkers} ${t('financial.activeWorkers')}`, accent: 'text-emerald-200' },
          { gradient: 'from-violet-500 to-purple-700', shadow: 'shadow-violet-500/20', title: t('financial.inventoryValue'), value: formatCurrency(0), sub: `${stats.totalInventory} ${t('financial.itemsInStock')}`, accent: 'text-violet-200' }
        ].map((card, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${card.gradient} text-white shadow-lg ${card.shadow} group cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 animate-fade-up`}
            style={{ animationDelay: `${0.2 + index * 0.1}s` }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <p className={`${card.accent} text-xs font-bold uppercase tracking-wider mb-2`}>{card.title}</p>
            <p className="text-3xl font-bold tracking-tight">{card.value}</p>
            <p className={`${card.accent} text-xs mt-2 font-medium flex items-center gap-1.5`}>
              <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
              {card.sub}
            </p>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6" aria-label="Quick actions">
        <h2 className="text-base font-bold text-construction-800 mb-4 flex items-center gap-2">
          <span className="text-lg">🚀</span>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              prefetch={false}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:scale-[1.02] min-h-[80px] ${action.classes}`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="font-semibold text-xs md:text-sm text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6" aria-label="Recent projects">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-construction-800 flex items-center gap-2">
              <span>📋</span> Recent Projects
            </h2>
            <Link href={localizePath('/dashboard/projects')} prefetch={false} className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              View All →
            </Link>
          </div>
          {recentProjects.length > 0 ? (
            <ul className="space-y-2.5">
              {recentProjects.map((project, index) => (
                <li key={index}>
                  <Link href={localizePath('/dashboard/projects')} prefetch={false} className="block group">
                    <div className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-construction-800 truncate group-hover:text-blue-700 transition-colors">{project.name}</div>
                          <div className="text-xs text-construction-400 truncate mt-1">{project.client}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-sm text-construction-900">{formatCurrency(project.budget)}</div>
                          <span className={`text-xs px-2.5 py-1 rounded-full inline-block mt-1.5 font-medium ${project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-construction-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-sm font-medium">No projects yet</p>
              <Link href={localizePath('/dashboard/projects')} prefetch={false} className="text-blue-600 hover:text-blue-700 text-xs font-semibold mt-1 inline-block">
                Create your first project
              </Link>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6" aria-label="Recent workers">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-construction-800 flex items-center gap-2">
              <span>👷</span> Recent Workers
            </h2>
            <Link href={localizePath('/dashboard/workers')} prefetch={false} className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              View All →
            </Link>
          </div>
          {recentWorkers.length > 0 ? (
            <ul className="space-y-2.5">
              {recentWorkers.map((worker, index) => (
                <li key={index}>
                  <Link href={localizePath('/dashboard/workers')} prefetch={false} className="block group">
                    <div className="p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-200">
                      <div className="flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {worker.photo ? (
                            <img src={worker.photo} alt={worker.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow-sm" loading="lazy" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                              {worker.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate text-construction-800 group-hover:text-emerald-700 transition-colors">{worker.name}</div>
                            <div className="text-xs text-construction-400 truncate">{worker.role}</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${worker.status === 'active' ? 'bg-emerald-100 text-emerald-700' : worker.status === 'on_leave' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                            {worker.status}
                          </span>
                          <div className="text-xs font-bold text-construction-700 mt-1.5">{formatCurrency(worker.dailyRate)}<span className="text-construction-400 font-medium">/day</span></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-construction-400">
              <p className="text-4xl mb-3">👷</p>
              <p className="text-sm font-medium">No workers yet</p>
              <Link href={localizePath('/dashboard/workers')} prefetch={false} className="text-blue-600 hover:text-blue-700 text-xs font-semibold mt-1 inline-block">
                Add your first worker
              </Link>
            </div>
          )}
        </section>
      </div>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6" aria-label="Low stock alerts">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-construction-800 flex items-center gap-2">
            <span className="text-lg">⚠️</span> Low Stock Alerts
          </h2>
          <Link href={localizePath('/dashboard/inventory')} prefetch={false} className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">
            View Inventory →
          </Link>
        </div>
        {lowStockItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.map((item, index) => (
              <Link key={index} href={localizePath('/dashboard/inventory')} prefetch={false} className="block group">
                <div className="p-4 rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 transition-all duration-200">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-construction-800 truncate">{item.name}</div>
                      <div className="text-xs text-construction-400 truncate mt-0.5">{item.category}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-sm text-red-600">{item.quantity} <span className="text-construction-400 font-medium">/ {item.minQuantity}</span></div>
                      <div className="text-xs text-construction-400">{item.unit}</div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-red-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, (item.quantity / Math.max(item.minQuantity, 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-construction-400">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-sm font-medium text-construction-600">All items are well stocked</p>
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6" aria-label="Quick stats overview">
        <h3 className="font-bold mb-4 text-sm text-construction-800 flex items-center gap-2">
          <span>📊</span> Quick Snapshot
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: 'MEP Systems', value: 'HVAC, Electrical, Plumbing, ELV', icon: '🏗️' },
            { label: 'Total Items', value: stats.totalInventory, icon: '📦', highlight: true },
            { label: 'Completed', value: `${stats.completedProjects} projects`, icon: '✅' },
            { label: 'Active Workers', value: stats.activeWorkers, icon: '👷', highlight: true }
          ].map((item, index) => (
            <div key={index} className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-colors">
              <span className="text-xs text-construction-400 font-medium block mb-1.5 flex items-center gap-1.5">
                <span>{item.icon}</span>
                {item.label}
              </span>
              <span className={`font-bold block tracking-tight ${item.highlight ? 'text-2xl text-construction-900' : 'text-sm text-construction-800'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ErrorBoundary>
        <DashboardContent />
      </ErrorBoundary>
    </Suspense>
  )
}
