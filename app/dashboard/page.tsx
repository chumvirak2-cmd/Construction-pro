'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getDashboardStats, projectsDb, workersDb, inventoryDb, boqDb } from '../lib/db'
import { Project, Worker, InventoryItem, BOQ, DashboardStats } from '../types'

export default function Dashboard() {
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
    loadData()
  }, [])

  const loadData = () => {
    const statsData = getDashboardStats()
    setStats(statsData)

    const projects = projectsDb.getAll()
    setRecentProjects(projects.slice(-5).reverse())

    const workers = workersDb.getAll()
    setRecentWorkers(workers.slice(-5).reverse())

    const inventory = inventoryDb.getAll()
    setLowStockItems(inventory.filter(i => i.minQuantity > 0 && i.quantity < i.minQuantity).slice(0, 5))

    const boqData = boqDb.getAll()
    setBoqs(boqData.slice(-5).reverse())
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
  }

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: '📋',
      color: 'bg-blue-500',
      link: '/dashboard/projects',
      label: 'View Projects',
      subtext: `${stats.activeProjects} active, ${stats.completedProjects} completed`
    },
    {
      title: 'Total Workers',
      value: stats.totalWorkers,
      icon: '👷',
      color: 'bg-green-500',
      link: '/dashboard/workers',
      label: 'Manage Workers',
      subtext: `${stats.activeWorkers} active`
    },
    {
      title: 'Inventory Items',
      value: stats.totalInventory,
      icon: '📦',
      color: 'bg-orange-500',
      link: '/dashboard/inventory',
      label: 'View Inventory',
      subtext: `${stats.lowStockItems} low stock`
    },
    {
      title: 'BOQ Documents',
      value: boqs.length,
      icon: '📄',
      color: 'bg-purple-500',
      link: '/dashboard/boq',
      label: 'View BOQs',
      subtext: 'Bill of Quantities'
    }
  ]

  const quickActions = [
    { label: 'Add Project', href: '/dashboard/projects', icon: '➕', color: 'bg-blue-50 text-blue-600' },
    { label: 'Add Worker', href: '/dashboard/workers', icon: '👤', color: 'bg-green-50 text-green-600' },
    { label: 'Add Inventory', href: '/dashboard/inventory', icon: '📥', color: 'bg-orange-50 text-orange-600' },
    { label: 'Create BOQ', href: '/dashboard/boq', icon: '🧮', color: 'bg-purple-50 text-purple-600' }
  ]

  return (
    <div className="pb-20 md:pb-6 px-2 md:px-0">
      {/* Welcome Header */}
      <div className="mb-4 md:mb-6 text-center">
        <h1 className="text-lg md:text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-xs md:text-sm">Welcome to Construction Pro AI Smart Agent</p>
      </div>

      {/* Stats Cards - Stacked on mobile, 2x2 grid on tablet, 4 cols on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
        {statCards.map((card, index) => (
          <Link key={index} href={card.link} className="block group">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-3 md:p-4 border-l-4 border-transparent hover:border-l-4 group-hover:scale-[1.02]" style={{ borderLeftColor: card.color.replace('bg-', '').includes('blue') ? '#3b82f6' : card.color.replace('bg-', '').includes('green') ? '#22c55e' : card.color.replace('bg-', '').includes('orange') ? '#f97316' : '#a855f7' }}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-medium">{card.title}</p>
                  <p className="text-xl md:text-3xl font-bold mt-1 text-gray-800">{card.value}</p>
                  <p className="text-[10px] md:text-xs text-gray-400 mt-1 truncate">{card.subtext}</p>
                </div>
                <div className={`${card.color} text-white text-lg md:text-xl p-2 rounded-xl shadow-sm flex-shrink-0 ml-2`}>
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
          <p className="text-blue-100 text-xs uppercase tracking-wider font-medium">Total Project Budget</p>
          <p className="text-xl md:text-2xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-blue-200 text-xs mt-1">{stats.totalProjects} projects</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-sm">
          <p className="text-green-100 text-xs uppercase tracking-wider font-medium">Monthly Labor Cost</p>
          <p className="text-xl md:text-2xl font-bold mt-2">{formatCurrency(stats.monthlyExpenses)}</p>
          <p className="text-green-200 text-xs mt-1">{stats.activeWorkers} active workers</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-sm">
          <p className="text-purple-100 text-xs uppercase tracking-wider font-medium">Inventory Value</p>
          <p className="text-xl md:text-2xl font-bold mt-2">{formatCurrency(0)}</p>
          <p className="text-purple-200 text-xs mt-1">{stats.totalInventory} items in stock</p>
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
              className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2 p-2 md:p-3 rounded-lg ${action.color} hover:opacity-80 transition-all hover:shadow-sm min-h-[44px]`}
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
            <Link href="/dashboard/projects" className="text-xs text-blue-600 hover:underline font-medium">
              View All →
            </Link>
          </div>
          {recentProjects.length > 0 ? (
            <div className="space-y-2">
              {recentProjects.map((project, index) => (
                <Link key={index} href="/dashboard/projects" className="block">
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
              <Link href="/dashboard/projects" className="text-blue-600 hover:underline text-xs font-medium">
                Create your first project
              </Link>
            </div>
          )}
        </div>

        {/* Recent Workers */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">Recent Workers</h2>
            <Link href="/dashboard/workers" className="text-xs text-blue-600 hover:underline font-medium">
              View All →
            </Link>
          </div>
          {recentWorkers.length > 0 ? (
            <div className="space-y-2">
              {recentWorkers.map((worker, index) => (
                <Link key={index} href="/dashboard/workers" className="block">
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
              <Link href="/dashboard/workers" className="text-blue-600 hover:underline text-xs font-medium">
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
          <Link href="/dashboard/inventory" className="text-xs text-blue-600 hover:underline font-medium">
            View Inventory →
          </Link>
        </div>
        {lowStockItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
            {lowStockItems.map((item, index) => (
              <Link key={index} href="/dashboard/inventory" className="block">
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
