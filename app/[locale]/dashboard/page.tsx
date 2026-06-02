'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { getDashboardData } from '../../lib/db'
import { Project, Worker, InventoryItem, BOQ, DashboardStats } from '../../types'

function DashboardSkeleton() {
  return (
    <div className="pb-20 md:pb-6 px-2 md:px-0">
      <div className="mb-4 md:mb-6 text-center">
        <div className="h-8 w-48 mx-auto mb-3 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="h-4 w-64 mx-auto rounded-full bg-gray-200 animate-pulse"></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 rounded-xl bg-white shadow-sm p-4 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 rounded-xl bg-white shadow-sm p-4 animate-pulse" />
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 mb-4 md:mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const localizePath = (href: string) => `/${locale}${href}`
  const [isLoading, setIsLoading] = useState(true)
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
  const [boqs, setBoqs] = useState<BOQ[]>([])

  useEffect(() => {
    const scheduleLoad = () => {
      const dashboardData = getDashboardData()
      setStats(dashboardData.stats)
      setRecentProjects(dashboardData.recentProjects)
      setRecentWorkers(dashboardData.recentWorkers)
      setLowStockItems(dashboardData.lowStockItems)
      setBoqs(dashboardData.boqs)
      setIsLoading(false)
    }

    let handle: any

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        handle = window.requestIdleCallback(scheduleLoad)
      } else {
        handle = setTimeout(scheduleLoad, 50)
      }
    } else {
      handle = setTimeout(scheduleLoad, 50)
    }

    return () => {
      if (typeof window !== 'undefined') {
        if (handle !== undefined) {
          if ('cancelIdleCallback' in window) {
            ;(window as any).cancelIdleCallback(handle)
          } else {
            clearTimeout(handle)
          }
        }
      } else {
        if (handle !== undefined) {
          clearTimeout(handle)
        }
      }
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
  }

  const statCards = useMemo(() => [
    {
      title: t('stats.projects.title'),
      value: stats.totalProjects,
      icon: '📋',
      colorClass: 'bg-blue-500',
      borderClass: 'border-blue-500',
      link: localizePath('/dashboard/projects'),
      label: t('stats.projects.label'),
      subtext: t('stats.projects.subtext', { active: stats.activeProjects, completed: stats.completedProjects })
    },
    {
      title: t('stats.workers.title'),
      value: stats.totalWorkers,
      icon: '👷',
      colorClass: 'bg-green-500',
      borderClass: 'border-green-500',
      link: localizePath('/dashboard/workers'),
      label: t('stats.workers.label'),
      subtext: t('stats.workers.subtext', { active: stats.activeWorkers })
    },
    {
      title: t('stats.inventory.title'),
      value: stats.totalInventory,
      icon: '📦',
      colorClass: 'bg-orange-500',
      borderClass: 'border-orange-500',
      link: localizePath('/dashboard/inventory'),
      label: t('stats.inventory.label'),
      subtext: t('stats.inventory.subtext', { lowStock: stats.lowStockItems })
    },
    {
      title: t('stats.boq.title'),
      value: boqs.length,
      icon: '📄',
      colorClass: 'bg-purple-500',
      borderClass: 'border-purple-500',
      link: localizePath('/dashboard/boq'),
      label: t('stats.boq.label'),
      subtext: t('stats.boq.subtext')
    }
  ], [stats, boqs, t])

  const quickActions = useMemo(() => [
    { label: t('quickActions.addProject'), href: localizePath('/dashboard/projects'), icon: '➕', classes: 'bg-blue-50 text-blue-600' },
    { label: t('quickActions.addWorker'), href: localizePath('/dashboard/workers'), icon: '👤', classes: 'bg-green-50 text-green-600' },
    { label: t('quickActions.addInventory'), href: localizePath('/dashboard/inventory'), icon: '📥', classes: 'bg-orange-50 text-orange-600' },
    { label: t('quickActions.createBOQ'), href: localizePath('/dashboard/boq'), icon: '🧮', classes: 'bg-purple-50 text-purple-600' }
  ], [t])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="pb-20 md:pb-6 px-2 md:px-0">
       {/* Welcome Header */}
       <div className="mb-4 md:mb-6 text-center">
         <h1 className="text-lg md:text-2xl font-bold text-gray-800">{t('welcome.title')}</h1>
         <p className="text-gray-500 text-xs md:text-sm">{t('welcome.subtitle')}</p>
       </div>

      {/* Stats Cards - Stacked on mobile, 2x2 grid on tablet, 4 cols on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
        {statCards.map((card, index) => (
          <Link key={index} href={card.link} className="block group">
            <div className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-3 md:p-4 border-l-4 ${card.borderClass} group-hover:scale-[1.02]`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-medium">{card.title}</p>
                  <p className="text-xl md:text-3xl font-bold mt-1 text-gray-800">{card.value}</p>
                  <p className="text-[10px] md:text-xs text-gray-400 mt-1 truncate">{card.subtext}</p>
                </div>
                <div className={`${card.colorClass} text-white text-lg md:text-xl p-2 rounded-xl shadow-sm flex-shrink-0 ml-2`}>
                  {card.icon}
                </div>
              </div>
              <p className="text-[10px] md:text-xs text-blue-600 mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">{card.label} →</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Financial Summary - Stacked on mobile, 3 cols on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
         <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-sm">
           <p className="text-blue-100 text-xs uppercase tracking-wider font-medium">{t('financial.totalBudget')}</p>
           <p className="text-xl md:text-2xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
           <p className="text-blue-200 text-xs mt-1">{stats.totalProjects} {t('financial.projects')}</p>
         </div>
         <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-sm">
           <p className="text-green-100 text-xs uppercase tracking-wider font-medium">{t('financial.monthlyLabor')}</p>
           <p className="text-xl md:text-2xl font-bold mt-2">{formatCurrency(stats.monthlyExpenses)}</p>
           <p className="text-green-200 text-xs mt-1">{stats.activeWorkers} {t('financial.activeWorkers')}</p>
         </div>
         <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-sm">
           <p className="text-purple-100 text-xs uppercase tracking-wider font-medium">{t('financial.inventoryValue')}</p>
           <p className="text-xl md:text-2xl font-bold mt-2">{formatCurrency(0)}</p>
           <p className="text-purple-200 text-xs mt-1">{stats.totalInventory} {t('financial.itemsInStock')}</p>
         </div>
      </div>

      {/* Quick Actions - Full width on mobile, side section on desktop */}
      <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 mb-4 md:mb-6">
        <h2 className="text-sm md:text-base font-bold mb-3 text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2 p-2 md:p-3 rounded-lg ${action.classes} hover:opacity-80 transition-all hover:shadow-sm min-h-[44px]`}
            >
              <span className="text-lg md:text-xl">{action.icon}</span>
              <span className="font-medium text-xs md:text-sm text-center md:text-left">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">Recent Projects</h2>
            <Link href={localizePath('/dashboard/projects')} className="text-xs text-blue-600 hover:underline font-medium">
              View All →
            </Link>
          </div>
          {recentProjects.length > 0 ? (
            <div className="space-y-2">
              {recentProjects.map((project, index) => (
                <Link key={index} href={localizePath('/dashboard/projects')} className="block">
                  <div className="p-3 border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{project.name}</div>
                        <div className="text-xs text-gray-500 truncate">{project.client}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-sm text-gray-800">{formatCurrency(project.budget)}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          project.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">No projects yet</p>
              <Link href={localizePath('/dashboard/projects')} className="text-blue-600 hover:underline text-xs font-medium">
                Create your first project
              </Link>
            </div>
          )}
        </div>

        {/* Recent Workers */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">Recent Workers</h2>
            <Link href={localizePath('/dashboard/workers')} className="text-xs text-blue-600 hover:underline font-medium">
              View All →
            </Link>
          </div>
          {recentWorkers.length > 0 ? (
            <div className="space-y-2">
              {recentWorkers.map((worker, index) => (
                <Link key={index} href={localizePath('/dashboard/workers')} className="block">
                  <div className="p-3 border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {worker.photo ? (
                          <img src={worker.photo} alt={worker.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
                            👷
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{worker.name}</div>
                          <div className="text-xs text-gray-500 truncate">{worker.role}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                          worker.status === 'active' ? 'bg-green-100 text-green-700' :
                          worker.status === 'on_leave' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {worker.status}
                        </span>
                        <div className="text-xs font-semibold mt-1 text-gray-700">{formatCurrency(worker.dailyRate)}/day</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p className="text-3xl mb-2">👷</p>
              <p className="text-sm">No workers yet</p>
              <Link href={localizePath('/dashboard/workers')} className="text-blue-600 hover:underline text-xs font-medium">
                Add your first worker
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800">⚠️ Low Stock Alerts</h2>
          <Link href={localizePath('/dashboard/inventory')} className="text-xs text-blue-600 hover:underline font-medium">
            View Inventory →
          </Link>
        </div>
        {lowStockItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
            {lowStockItems.map((item, index) => (
              <Link key={index} href={localizePath('/dashboard/inventory')} className="block">
                <div className="p-3 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{item.name}</div>
                      <div className="text-xs text-gray-500 truncate">{item.category}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-red-600 text-sm">{item.quantity} / {item.minQuantity}</div>
                      <div className="text-xs text-gray-500">{item.unit}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-sm">All items are well stocked</p>
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-semibold mb-3 text-sm text-gray-800">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-gray-50 rounded-lg p-3">
            <span className="text-gray-500 block">MEP Systems</span>
            <span className="font-semibold text-gray-800 mt-1 block">HVAC, Electrical, Plumbing, ELV</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <span className="text-gray-500 block">Total Items</span>
            <span className="font-semibold text-gray-800 mt-1 block">{stats.totalInventory}</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <span className="text-gray-500 block">Completed</span>
            <span className="font-semibold text-gray-800 mt-1 block">{stats.completedProjects} projects</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <span className="text-gray-500 block">Active Workers</span>
            <span className="font-semibold text-gray-800 mt-1 block">{stats.activeWorkers}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
