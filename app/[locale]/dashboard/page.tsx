'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { getDashboardStats, projectsDb, workersDb, inventoryDb, boqDb } from '../../lib/db'
import type { Project, Worker, InventoryItem, BOQ, DashboardStats } from '../../types'

function DashboardContent() {
  const locale = useLocale()
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0, activeProjects: 0, completedProjects: 0,
    totalWorkers: 0, activeWorkers: 0, totalInventory: 0, lowStockItems: 0,
    totalRevenue: 0, monthlyExpenses: 0
  })
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [recentWorkers, setRecentWorkers] = useState<Worker[]>([])
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [boqs, setBoqs] = useState<BOQ[]>([])

  useEffect(() => {
    setStats(getDashboardStats())
    setRecentProjects(projectsDb.getAll().slice(-5).reverse())
    setRecentWorkers(workersDb.getAll().slice(-5).reverse())
    setLowStockItems(inventoryDb.getAll().filter(i => i.minQuantity > 0 && i.quantity < i.minQuantity).slice(0, 5))
    setBoqs(boqDb.getAll().slice(-5).reverse())
  }, [])

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return '$0'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
  }

  const linkBase = `/${locale}`

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
            <h1 className="text-3xl font-semibold text-slate-900">Construction Pro</h1>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 border border-slate-200/70">
            Minimal · Modern · Practical
          </div>
        </div>
        <p className="max-w-2xl text-sm text-slate-500">A cleaner interface with focused metrics and subtle visual structure for faster decisions.</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Projects', value: stats.totalProjects, metric: `${stats.activeProjects} active`, link: `${linkBase}/dashboard/projects/`, accent: 'from-rose-500/10 via-rose-100 to-white', text: 'text-rose-800' },
          { title: 'Workers', value: stats.totalWorkers, metric: `${stats.activeWorkers} active`, link: `${linkBase}/dashboard/workers/`, accent: 'from-sky-500/10 via-sky-100 to-white', text: 'text-sky-800' },
          { title: 'Inventory', value: stats.totalInventory, metric: `${stats.lowStockItems} low stock`, link: `${linkBase}/dashboard/inventory/`, accent: 'from-emerald-500/10 via-emerald-100 to-white', text: 'text-emerald-800' },
          { title: 'BOQ', value: boqs.length, metric: 'Bill of Quantities', link: `${linkBase}/dashboard/boq`, accent: 'from-violet-500/10 via-violet-100 to-white', text: 'text-violet-800' }
        ].map((card, index) => (
          <Link key={index} href={card.link} className="group block">
            <div className={`h-full rounded-[28px] border border-slate-200/70 bg-gradient-to-br ${card.accent} p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/40`}>
              <div className="flex items-center justify-between text-slate-500 text-xs uppercase tracking-[0.2em] mb-4">
                <span>{card.title}</span>
                <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold tracking-[0.25em] text-slate-500">View</span>
              </div>
              <div className={`text-4xl font-semibold ${card.text}`}>{card.value}</div>
              <div className="mt-2 text-sm text-slate-500">{card.metric}</div>
            </div>
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-[28px] bg-slate-50 border border-slate-200/70 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Recent Projects</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Latest</span>
          </div>
          {recentProjects.length > 0 ? (
            <ul className="space-y-3">
              {recentProjects.map((project, index) => (
                <li key={index} className="rounded-3xl border border-slate-200 bg-white/80 p-4">
                  <div className="font-medium text-slate-900">{project.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{project.client}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No projects yet</p>
          )}
        </section>

        <section className="rounded-[28px] bg-slate-50 border border-slate-200/70 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Recent Workers</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Latest</span>
          </div>
          {recentWorkers.length > 0 ? (
            <ul className="space-y-3">
              {recentWorkers.map((worker, index) => (
                <li key={index} className="rounded-3xl border border-slate-200 bg-white/80 p-4">
                  <div className="font-medium text-slate-900">{worker.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{worker.role}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No workers yet</p>
          )}
        </section>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return <DashboardContent />
}