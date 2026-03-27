'use client'

import { useState, useEffect } from 'react'
import { Project, ProjectStatus, MEPSystem, BuildingType } from '../../types'
import { projectsDb } from '../../lib/db'

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  on_hold: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const systemOptions: MEPSystem[] = ['HVAC', 'Electrical', 'Plumbing', 'ELV', 'Fire Protection', 'Gas System', 'Solar/Energy', 'BMS/Controls', 'Lift & Escalator']
const buildingTypeOptions: BuildingType[] = ['Villa', 'Townhouse', 'Shophouse', 'Apartment', 'Condominium', 'Office Building', 'Shopping Mall', 'Warehouse', 'Factory', 'Hospital', 'School', 'Hotel', 'Resort', 'Mixed-Use', 'Other']
const statusOptions: ProjectStatus[] = ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']

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

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = () => {
    const data = projectsDb.getAll()
    setProjects(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }

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

  const filteredProjects = projects.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-gray-500">Manage your construction projects</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | 'all')}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="all">All Status</option>
            {statusOptions.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setView('grid')}
              className={`px-4 py-2 rounded-lg ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Project Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{editingProject ? 'Edit Project' : 'New Project'}</h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Project Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Client *</label>
                    <input
                      type="text"
                      value={form.client}
                      onChange={(e) => setForm({ ...form, client: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Building Type *</label>
                    <select
                      value={form.buildingType}
                      onChange={(e) => setForm({ ...form, buildingType: e.target.value as BuildingType })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                      {buildingTypeOptions.map(bt => (
                        <option key={bt} value={bt}>{bt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status *</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                      {statusOptions.map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Project Manager</label>
                    <input
                      type="text"
                      value={form.manager}
                      onChange={(e) => setForm({ ...form, manager: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Budget ($)</label>
                    <input
                      type="number"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: parseFloat(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Actual Cost ($)</label>
                    <input
                      type="number"
                      value={form.actualCost}
                      onChange={(e) => setForm({ ...form, actualCost: parseFloat(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">MEP Systems</label>
                  <div className="flex flex-wrap gap-3">
                    {systemOptions.map(system => (
                      <label key={system} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.systems.includes(system)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, systems: [...form.systems, system] })
                            } else {
                              setForm({ ...form, systems: form.systems.filter(s => s !== system) })
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span>{system}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">IT & Technology</label>
                  <div className="flex flex-wrap gap-3">
                    {['Web Development', 'Mobile App Development', 'UI/UX Design', 'Database & CMS', 'E-Commerce', 'SEO & Analytics', 'Hosting & Domain', 'API Integration'].map(it => (
                      <label key={it} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.itSystems.includes(it)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, itSystems: [...form.itSystems, it] })
                            } else {
                              setForm({ ...form, itSystems: form.itSystems.filter(s => s !== it) })
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span>{it}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700">No projects found</h3>
          <p className="text-gray-500">Create your first project to get started</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div key={project.id} className="bg-white rounded-xl shadow hover:shadow-md transition-shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">{project.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{project.description || 'No description'}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Client:</span>
                  <span className="font-medium">{project.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Building:</span>
                  <span className="font-medium">{project.buildingType || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Budget:</span>
                  <span className="font-medium">{formatCurrency(project.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Systems:</span>
                  <span className="font-medium text-right">{project.systems.join(', ')}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => handleEdit(project)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium">Project</th>
                <th className="text-left p-4 font-medium">Client</th>
                <th className="text-left p-4 font-medium">Building Type</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Budget</th>
                <th className="text-left p-4 font-medium">Systems</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <tr key={project.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-gray-500">{project.location}</div>
                  </td>
                  <td className="p-4">{project.client}</td>
                  <td className="p-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-medium">
                      {project.buildingType || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">{formatCurrency(project.budget)}</td>
                  <td className="p-4">{project.systems.join(', ')}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(project)} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(project.id)} className="text-red-600 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
          <div className="text-gray-500 text-sm">Total Projects</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-green-600">{projects.filter(p => p.status === 'in_progress').length}</div>
          <div className="text-gray-500 text-sm">Active Projects</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-purple-600">{projects.filter(p => p.status === 'completed').length}</div>
          <div className="text-gray-500 text-sm">Completed</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(projects.reduce((sum, p) => sum + p.budget, 0))}</div>
          <div className="text-gray-500 text-sm">Total Budget</div>
        </div>
      </div>
    </div>
  )
}
