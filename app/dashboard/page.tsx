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
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to Construction Pro ERP</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Link key={index} href={card.link} className="block">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.subtext}</p>
                </div>
                <div className={`${card.color} text-white text-3xl p-3 rounded-xl`}>
                  {card.icon}
                </div>
              </div>
              <p className="text-sm text-blue-600 mt-3 font-medium">{card.label} →</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <p className="text-blue-100">Total Project Budget</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-blue-100 text-sm mt-2">Across {stats.totalProjects} projects</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <p className="text-green-100">Monthly Labor Cost</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(stats.monthlyExpenses)}</p>
          <p className="text-green-100 text-sm mt-2">{stats.activeWorkers} active workers</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <p className="text-purple-100">Inventory Value</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(0)}</p>
          <p className="text-purple-100 text-sm mt-2">{stats.totalInventory} items in stock</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={`flex items-center gap-3 p-4 rounded-lg ${action.color} hover:opacity-80 transition-opacity`}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Projects</h2>
            <Link href="/dashboard/projects" className="text-sm text-blue-600 hover:underline">
              View All →
            </Link>
          </div>
          {recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map((project, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-gray-500">{project.client}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(project.budget)}</div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">📋</p>
              <p>No projects yet</p>
              <Link href="/dashboard/projects" className="text-blue-600 hover:underline text-sm">
                Create your first project
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">⚠️ Low Stock Alerts</h2>
            <Link href="/dashboard/inventory" className="text-sm text-blue-600 hover:underline">
              View Inventory →
            </Link>
          </div>
          {lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {lowStockItems.map((item, index) => (
                <div key={index} className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-600">{item.quantity} / {item.minQuantity}</div>
                      <div className="text-xs text-gray-500">{item.unit}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">✅</p>
              <p>All items are well stocked</p>
            </div>
          )}
        </div>

        {/* Recent Workers */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Workers</h2>
            <Link href="/dashboard/workers" className="text-sm text-blue-600 hover:underline">
              View All →
            </Link>
          </div>
            {recentWorkers.length > 0 ? (
            <div className="space-y-3">
              {recentWorkers.map((worker, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {worker.photo ? (
                        <img src={worker.photo} alt={worker.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                          👷
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{worker.name}</div>
                        <div className="text-sm text-gray-500">{worker.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        worker.status === 'active' ? 'bg-green-100 text-green-800' :
                        worker.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {worker.status}
                      </span>
                      <div className="text-sm font-medium mt-1">{formatCurrency(worker.dailyRate)}/day</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">👷</p>
              <p>No workers yet</p>
              <Link href="/dashboard/workers" className="text-blue-600 hover:underline text-sm">
                Add your first worker
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">MEP Systems:</span>
            <span className="ml-2 font-medium">HVAC, Electrical, Plumbing, ELV</span>
          </div>
          <div>
            <span className="text-gray-500">Categories:</span>
            <span className="ml-2 font-medium">{stats.totalInventory}</span>
          </div>
          <div>
            <span className="text-gray-500">Completed Projects:</span>
            <span className="ml-2 font-medium">{stats.completedProjects}</span>
          </div>
          <div>
            <span className="text-gray-500">Active Workers:</span>
            <span className="ml-2 font-medium">{stats.activeWorkers}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
