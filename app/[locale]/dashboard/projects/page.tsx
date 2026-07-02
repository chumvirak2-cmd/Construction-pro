'use client'

import { useState, useEffect, useMemo } from 'react'
import { Project, ProjectStatus, MEPSystem, BuildingType } from '../../../types'
import { projectsDb } from '../../../lib/db'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const statusConfig: Record<ProjectStatus, { label: string; classes: string; dot: string }> = {
  planning: { label: 'Planning', classes: 'bg-yellow-50 text-yellow-700 border border-yellow-200', dot: 'bg-yellow-400' },
  in_progress: { label: 'In Progress', classes: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500' },
  on_hold: { label: 'On Hold', classes: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
  completed: { label: 'Completed', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500' }
}

const systemOptions: MEPSystem[] = ['HVAC', 'Electrical', 'Plumbing', 'ELV', 'Fire Protection', 'Gas System', 'Solar/Energy', 'BMS/Controls', 'Lift & Escalator']
const buildingTypeOptions: BuildingType[] = ['Villa', 'Townhouse', 'Shophouse', 'Apartment', 'Condominium', 'Office Building', 'Shopping Mall', 'Warehouse', 'Factory', 'Hospital', 'School', 'Hotel', 'Resort', 'Mixed-Use', 'Other']
const statusOptions: ProjectStatus[] = ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']

const fieldClasses = 'rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200/70'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    client: '',
    location: '',
    buildingType: 'Villa' as BuildingType,
    startDate: '',
    endDate: '',
    status: 'planning' as ProjectStatus,
    systems: [] as MEPSystem[],
    itSystems: [] as string[],
    budget: 0,
    actualCost: 0,
    manager: ''
  })

  const loadProjects = () => {
    const data = projectsDb.getAll()
    setProjects(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingProject) {
      projectsDb.update(editingProject.id, form)
    } else {
      projectsDb.create(form as any)
    }
    loadProjects()
    resetForm()
  }

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      client: '',
      location: '',
      buildingType: 'Villa',
      startDate: '',
      endDate: '',
      status: 'planning',
      systems: [],
      itSystems: [],
      budget: 0,
      actualCost: 0,
      manager: ''
    })
    setShowForm(false)
    setEditingProject(null)
  }

  const handleEdit = (project: Project) => {
    setForm({
      name: project.name,
      description: project.description,
      client: project.client,
      location: project.location,
      buildingType: project.buildingType || 'Villa',
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate?.split('T')[0] || '',
      status: project.status,
      systems: project.systems,
      itSystems: project.itSystems || [],
      budget: project.budget,
      actualCost: project.actualCost,
      manager: project.manager
    })
    setEditingProject(project)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      projectsDb.delete(id)
      loadProjects()
    }
  }

  const filteredProjects = useMemo(() => projects.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  }), [projects, filterStatus, searchTerm])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">Manage your construction projects</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="gradient-btn-primary px-5 py-2.5 min-h-[44px] flex items-center gap-2 shadow-lg shadow-blue-500/25 magnetic-btn"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Project</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${fieldClasses} pl-10`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | 'all')}
            className={`${fieldClasses} md:w-48`}
          >
            <option value="all">All Status</option>
            {statusOptions.map(s => (
              <option key={s} value={s}>{statusConfig[s].label}</option>
            ))}
          </select>
          <div className="flex gap-2 bg-slate-100/50 p-1 rounded-xl">
            <button
              onClick={() => setView('grid')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                view === 'grid' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                view === 'list' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Project Form Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-[32px] border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 md:p-8 shadow-[0_28px_80px_-35px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
                {editingProject ? 'Edit Project' : 'New Project'}
              </h2>
              <button
                onClick={resetForm}
                className="w-10 h-10 rounded-full bg-slate-100/90 flex items-center justify-center text-slate-600 shadow-sm transition-colors duration-200 hover:bg-slate-200 hover:text-slate-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`${fieldClasses}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Client *</label>
                  <input
                    type="text"
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                    className={`${fieldClasses}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${fieldClasses} resize-none`}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className={fieldClasses}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Building Type *</label>
                  <select
                    value={form.buildingType}
                    onChange={(e) => setForm({ ...form, buildingType: e.target.value as BuildingType })}
                    className={fieldClasses}
                  >
                    {buildingTypeOptions.map(bt => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className={fieldClasses}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className={fieldClasses}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
                    className={fieldClasses}
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{statusConfig[s].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Manager</label>
                  <input
                    type="text"
                    value={form.manager}
                    onChange={(e) => setForm({ ...form, manager: e.target.value })}
                    className={fieldClasses}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Budget ($)</label>
                  <input
                    type="number"
                    value={form.budget || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setForm({ ...form, budget: isNaN(val) ? 0 : val });
                    }}
                    className={fieldClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Actual Cost ($)</label>
                  <input
                    type="number"
                    value={form.actualCost || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setForm({ ...form, actualCost: isNaN(val) ? 0 : val });
                    }}
                    className={fieldClasses}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">MEP Systems</label>
                <div className="flex flex-wrap gap-2">
                  {systemOptions.map(system => (
                    <button
                      key={system}
                      type="button"
                      onClick={() => {
                        if (form.systems.includes(system)) {
                          setForm({ ...form, systems: form.systems.filter(s => s !== system) })
                        } else {
                          setForm({ ...form, systems: [...form.systems, system] })
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        form.systems.includes(system)
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {system}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <button
                  type="submit"
                  className="flex-1 rounded-3xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 animate-fade-up">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📋</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No projects found</h3>
          <p className="text-slate-500 mb-4">Create your first project to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="gradient-btn-primary px-6 py-2.5 font-medium"
          >
            Create First Project
          </button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProjects.map((project, index) => {
            const statusInfo = statusConfig[project.status]
            return (
              <div 
                key={project.id} 
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 animate-fade-up min-h-[200px]"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-slate-900 truncate flex-1 group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.classes} ml-2`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">
                    {project.description || 'No description'}
                  </p>
                  <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Client</span>
                      <span className="font-medium text-slate-900 truncate max-w-[120px]">{project.client}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Building</span>
                      <span className="font-medium text-slate-900">{project.buildingType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Budget</span>
                      <span className="font-bold text-slate-900">{formatCurrency(project.budget)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleEdit(project)}
                      className="flex-1 py-2.5 rounded-xl font-medium text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all duration-200 min-h-[44px]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="flex-1 py-2.5 rounded-xl font-medium text-sm text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-200 min-h-[44px]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-700 text-sm">Project</th>
                <th className="text-left p-4 font-semibold text-slate-700 text-sm">Client</th>
                <th className="text-left p-4 font-semibold text-slate-700 text-sm">Building Type</th>
                <th className="text-left p-4 font-semibold text-slate-700 text-sm">Status</th>
                <th className="text-left p-4 font-semibold text-slate-700 text-sm">Budget</th>
                <th className="text-left p-4 font-semibold text-slate-700 text-sm">Systems</th>
                <th className="text-left p-4 font-semibold text-slate-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const statusInfo = statusConfig[project.status]
                return (
                  <tr key={project.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{project.name}</div>
                      <div className="text-sm text-slate-500">{project.location}</div>
                    </td>
                    <td className="p-4 text-slate-700">{project.client}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700">
                        {project.buildingType || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.classes}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{formatCurrency(project.budget)}</td>
                    <td className="p-4 text-sm text-slate-600 truncate max-w-[180px]">
                      {project.systems.join(', ')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(project)} 
                          className="px-4 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(project.id)} 
                          className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card-modern">
          <div className="text-3xl font-bold text-blue-600">{projects.length}</div>
          <div className="text-slate-500 text-sm font-medium mt-1">Total Projects</div>
        </div>
        <div className="stat-card-modern">
          <div className="text-3xl font-bold text-emerald-600">{useMemo(() => projects.filter(p => p.status === 'in_progress').length, [projects])}</div>
          <div className="text-slate-500 text-sm font-medium mt-1">Active Projects</div>
        </div>
        <div className="stat-card-modern">
          <div className="text-3xl font-bold text-violet-600">{useMemo(() => projects.filter(p => p.status === 'completed').length, [projects])}</div>
          <div className="text-slate-500 text-sm font-medium mt-1">Completed</div>
        </div>
        <div className="stat-card-modern">
          <div className="text-3xl font-bold text-slate-900">{formatCurrency(useMemo(() => projects.reduce((sum, p) => sum + p.budget, 0), [projects]))}</div>
          <div className="text-slate-500 text-sm font-medium mt-1">Total Budget</div>
        </div>
      </div>
    </div>
  )
}