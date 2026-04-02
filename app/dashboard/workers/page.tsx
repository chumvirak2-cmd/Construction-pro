'use client'

import { useState, useEffect } from 'react'
import { Worker, WorkerRole, AttendanceRecord } from '../../types'
import { workersDb, attendanceDb } from '../../lib/db'

const roleOptions: WorkerRole[] = [
  // Construction & MEP Trades
  'Electrician', 'Plumber', 'HVAC Technician', 'Welder', 'Carpenter',
  'Mason', 'Painter', 'Roofer', 'Iron Worker', 'Pipe Fitter',
  'Scaffolder', 'Crane Operator', 'Heavy Equipment Operator', 'Tile Setter',
  'Glazier', 'Drywall Installer', 'Flooring Installer',
  // Engineering & Technical
  'Site Engineer', 'Structural Engineer', 'Civil Engineer', 'MEP Engineer',
  'Quality Control Engineer', 'Safety Engineer', 'IT Engineer', 'Surveyor',
  'Geotechnical Engineer', 'Estimation Engineer',
  // Project Management & Supervision
  'Project Manager', 'Project Coordinator', 'Construction Manager',
  'Site Supervisor', 'Foreman', 'General Foreman', 'Supervisor',
  // Real Estate Development
  'Real Estate Developer', 'Land Acquisition Manager', 'Property Manager',
  'Leasing Agent', 'Real Estate Agent', 'Real Estate Broker',
  'Valuation Specialist', 'Market Analyst', 'Land Surveyor',
  // Design & Architecture
  'Architect', 'Interior Designer', 'Landscape Architect', 'Drafter',
  'BIM Modeler', '3D Visualizer',
  // Administrative & Support
  'Accountant', 'Admin', 'HR Manager', 'Procurement Officer', 'Stock Manager',
  'Warehouse Keeper', 'Document Controller', 'Secretary', 'Receptionist',
  'Legal Advisor', 'Contract Administrator',
  // Sales & Marketing
  'Sales Manager', 'Marketing Manager', 'Sales Agent', 'Digital Marketing Specialist',
  // Operations & Maintenance
  'Facility Manager', 'Maintenance Technician', 'Building Inspector',
  'Security Guard', 'Cleaner', 'Landscaper',
  // General Labor
  'General Worker', 'Laborer', 'Helper',
  // IT & Technology
  'Web Developer', 'Mobile App Developer', 'Software Developer',
  'UI/UX Designer', 'IT Support', 'Database Administrator', 'Network Engineer'
]

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  on_leave: 'bg-yellow-100 text-yellow-800'
}

export default function Workers() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [view, setView] = useState<'workers' | 'attendance'>('workers')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<WorkerRole | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const [siteCenter, setSiteCenter] = useState({ lat: 40.7128, lng: -74.0060 })
  const [siteRadiusMeters, setSiteRadiusMeters] = useState(500)

  const [form, setForm] = useState({
    name: '',
    role: '' as WorkerRole,
    skills: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    address: '',
    photo: null as File | null,
    hourlyRate: 0,
    dailyRate: 0,
    overtimeRate: 0,
    joinDate: '',
    status: 'active' as 'active' | 'inactive' | 'on_leave'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setWorkers(workersDb.getAll())
    setAttendance(attendanceDb.getAll())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const workerData = {
      name: form.name,
      role: form.role,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      phone: form.phone,
      email: form.email || undefined,
      dateOfBirth: form.dateOfBirth,
      address: form.address || undefined,
      photo: form.photo ? URL.createObjectURL(form.photo) : editingWorker?.photo,
      hourlyRate: Number(form.hourlyRate),
      dailyRate: Number(form.dailyRate),
      overtimeRate: Number(form.overtimeRate),
      joinDate: form.joinDate,
      status: form.status
    }
    
    if (editingWorker) {
      workersDb.update(editingWorker.id, workerData)
    } else {
      workersDb.create(workerData as any)
    }
    loadData()
    resetForm()
  }

  const resetForm = () => {
    setForm({
      name: '',
      role: '' as WorkerRole,
      skills: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      address: '',
      photo: null,
      hourlyRate: 0,
      dailyRate: 0,
      overtimeRate: 0,
      joinDate: '',
      status: 'active'
    })
    setShowForm(false)
    setEditingWorker(null)
  }

  const handleEdit = (worker: Worker) => {
    setForm({
      name: worker.name,
      role: worker.role,
      skills: worker.skills.join(', '),
      phone: worker.phone,
      email: worker.email || '',
      dateOfBirth: worker.dateOfBirth.split('T')[0],
      address: worker.address || '',
      photo: null,
      hourlyRate: worker.hourlyRate,
      dailyRate: worker.dailyRate,
      overtimeRate: worker.overtimeRate,
      joinDate: worker.joinDate.split('T')[0],
      status: worker.status
    })
    setEditingWorker(worker)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      workersDb.delete(id)
      loadData()
    }
  }

  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180
    const R = 6371000
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const handleScanLocation = (workerId: string) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const distance = haversineDistance(latitude, longitude, siteCenter.lat, siteCenter.lng)
        const isValid = distance <= siteRadiusMeters
        
        // Record attendance
        const existingRecord = attendance.find(a => a.workerId === workerId && a.date === selectedDate)
        
        if (existingRecord) {
          attendanceDb.update(existingRecord.id, {
            checkOut: new Date().toISOString(),
            location: { lat: latitude, lng: longitude },
            status: isValid ? 'present' : 'late'
          })
        } else {
          attendanceDb.create({
            workerId,
            date: selectedDate,
            checkIn: new Date().toISOString(),
            location: { lat: latitude, lng: longitude },
            status: isValid ? 'present' : 'late'
          })
        }
        
        alert(isValid ? '✓ Check-in successful! You are at the site.' : '⚠ You are outside the site area.')
        loadData()
      },
      () => alert('Unable to get location. Please allow location access.')
    )
  }

  const markAbsent = (workerId: string) => {
    const existingRecord = attendance.find(a => a.workerId === workerId && a.date === selectedDate)
    if (!existingRecord) {
      attendanceDb.create({
        workerId,
        date: selectedDate,
        status: 'absent'
      })
      loadData()
    }
  }

  const filteredWorkers = workers.filter(w => {
    const matchesRole = filterRole === 'all' || w.role === filterRole
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.phone.includes(searchTerm)
    return matchesRole && matchesSearch
  })

  const getAttendanceStatus = (workerId: string) => {
    return attendance.find(a => a.workerId === workerId && a.date === selectedDate)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Workers & Attendance</h1>
          <p className="text-gray-500">Manage workers and track attendance</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('workers')}
            className={`px-4 py-2 rounded-lg ${view === 'workers' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Workers
          </button>
          <button
            onClick={() => setView('attendance')}
            className={`px-4 py-2 rounded-lg ${view === 'attendance' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Attendance
          </button>
        </div>
      </div>

      {view === 'workers' ? (
        <>
          {/* Filters and Add Button */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search workers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
              />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as WorkerRole | 'all')}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="all">All Roles</option>
                {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Add Worker
              </button>
            </div>
          </div>

          {/* Worker Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{editingWorker ? 'Edit Worker' : 'Add New Worker'}</h2>
                    <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">✕</button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Role *</label>
                        <select
                          value={form.role}
                          onChange={(e) => setForm({ ...form, role: e.target.value as WorkerRole })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          required
                        >
                          <option value="">Select Role</option>
                          {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone *</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
                      <input
                        type="text"
                        value={form.skills}
                        onChange={(e) => setForm({ ...form, skills: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="e.g., Wiring, Pipe fitting, HVAC installation"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={form.dateOfBirth}
                          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Join Date</label>
                        <input
                          type="date"
                          value={form.joinDate}
                          onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Address</label>
                      <textarea
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Hourly Rate ($)</label>
                        <input
                          type="number"
                          value={form.hourlyRate}
                          onChange={(e) => setForm({ ...form, hourlyRate: parseFloat(e.target.value) || 0 })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Daily Rate ($)</label>
                        <input
                          type="number"
                          value={form.dailyRate}
                          onChange={(e) => setForm({ ...form, dailyRate: parseFloat(e.target.value) || 0 })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Overtime Rate ($)</label>
                        <input
                          type="number"
                          value={form.overtimeRate}
                          onChange={(e) => setForm({ ...form, overtimeRate: parseFloat(e.target.value) || 0 })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on_leave">On Leave</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                      {editingWorker?.photo && (
                        <div className="mt-2 flex items-center gap-3">
                          <img src={editingWorker.photo} alt="Current" className="h-16 w-16 object-cover rounded-lg" />
                          <span className="text-sm text-gray-500">Current photo</span>
                        </div>
                      )}
                      {form.photo && (
                        <div className="mt-2">
                          <img src={URL.createObjectURL(form.photo)} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4 col-span-2">
                      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        {editingWorker ? 'Update Worker' : 'Add Worker'}
                      </button>
                      <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Workers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkers.map(worker => (
              <div key={worker.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {worker.photo ? (
                      <img src={worker.photo} alt={worker.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                        👷
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg">{worker.name}</h3>
                      <p className="text-gray-500 text-sm">{worker.role}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[worker.status]}`}>
                    {worker.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span>{worker.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Daily Rate:</span>
                    <span>{formatCurrency(worker.dailyRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Skills:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {worker.skills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(worker)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(worker.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredWorkers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👷</div>
              <h3 className="text-xl font-semibold text-gray-700">No workers found</h3>
              <p className="text-gray-500">Add your first worker to get started</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Attendance View */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                <label className="block text-sm font-medium mb-1">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {attendance.filter(a => a.date === selectedDate && a.status === 'present').length}
                  </div>
                  <div className="text-sm text-gray-500">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {attendance.filter(a => a.date === selectedDate && a.status === 'absent').length}
                  </div>
                  <div className="text-sm text-gray-500">Absent</div>
                </div>
              </div>
            </div>
          </div>

          {/* Site Settings */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-semibold mb-3">Site Location Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Site Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={siteCenter.lat}
                  onChange={(e) => setSiteCenter({ ...siteCenter, lat: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Site Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={siteCenter.lng}
                  onChange={(e) => setSiteCenter({ ...siteCenter, lng: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Allowed Radius (m)</label>
                <input
                  type="number"
                  value={siteRadiusMeters}
                  onChange={(e) => setSiteRadiusMeters(parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
            </div>
          </div>

          {/* Attendance List */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">Worker</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Check In</th>
                  <th className="text-left p-4 font-medium">Check Out</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map(worker => {
                  const record = getAttendanceStatus(worker.id)
                  return (
                    <tr key={worker.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {worker.photo ? (
                            <img src={worker.photo} alt={worker.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                              👷
                            </div>
                          )}
                          <div className="font-medium">{worker.name}</div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500">{worker.role}</td>
                      <td className="p-4">
                        {record?.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                      </td>
                      <td className="p-4">
                        {record?.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record?.status === 'present' ? 'bg-green-100 text-green-800' :
                          record?.status === 'absent' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record?.status?.toUpperCase() || 'NOT MARKED'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleScanLocation(worker.id)}
                            className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200"
                          >
                            Check In/Out
                          </button>
                          <button
                            onClick={() => markAbsent(worker.id)}
                            className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200"
                          >
                            Mark Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-blue-600">{workers.length}</div>
          <div className="text-gray-500 text-sm">Total Workers</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-green-600">{workers.filter(w => w.status === 'active').length}</div>
          <div className="text-gray-500 text-sm">Active Workers</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(workers.reduce((sum, w) => sum + w.dailyRate, 0))}</div>
          <div className="text-gray-500 text-sm">Daily Labor Cost</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(workers.reduce((sum, w) => sum + (w.dailyRate * 26), 0))}</div>
          <div className="text-gray-500 text-sm">Monthly Labor Cost</div>
        </div>
      </div>
    </div>
  )
}
