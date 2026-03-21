import { Project, Worker, InventoryItem, BOQ, AttendanceRecord, PayrollRecord, PurchaseOrder, User, AppSettings, DashboardStats } from '../types'

// Storage keys
const STORAGE_KEYS = {
  PROJECTS: 'cp_projects',
  WORKERS: 'cp_workers',
  INVENTORY: 'cp_inventory',
  BOQS: 'cp_boqs',
  ATTENDANCE: 'cp_attendance',
  PAYROLL: 'cp_payroll',
  PURCHASE_ORDERS: 'cp_purchase_orders',
  USERS: 'cp_users',
  SETTINGS: 'cp_settings',
  CURRENT_USER: 'cp_current_user'
}

// Generic CRUD operations
function getCollection<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(key)
  if (!data) return []
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

function setCollection<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Projects
export const projectsDb = {
  getAll: () => getCollection<Project>(STORAGE_KEYS.PROJECTS),
  getById: (id: string) => projectsDb.getAll().find(p => p.id === id),
  create: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const projects = projectsDb.getAll()
    const newProject: Project = {
      ...project,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    projects.push(newProject)
    setCollection(STORAGE_KEYS.PROJECTS, projects)
    return newProject
  },
  update: (id: string, data: Partial<Project>) => {
    const projects = projectsDb.getAll()
    const index = projects.findIndex(p => p.id === id)
    if (index !== -1) {
      projects[index] = { ...projects[index], ...data, updatedAt: new Date().toISOString() }
      setCollection(STORAGE_KEYS.PROJECTS, projects)
      return projects[index]
    }
    return null
  },
  delete: (id: string) => {
    const projects = projectsDb.getAll().filter(p => p.id !== id)
    setCollection(STORAGE_KEYS.PROJECTS, projects)
  }
}

// Workers
export const workersDb = {
  getAll: () => getCollection<Worker>(STORAGE_KEYS.WORKERS),
  getById: (id: string) => workersDb.getAll().find(w => w.id === id),
  create: (worker: Omit<Worker, 'id' | 'createdAt'>) => {
    const workers = workersDb.getAll()
    const newWorker: Worker = {
      ...worker,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    workers.push(newWorker)
    setCollection(STORAGE_KEYS.WORKERS, workers)
    return newWorker
  },
  update: (id: string, data: Partial<Worker>) => {
    const workers = workersDb.getAll()
    const index = workers.findIndex(w => w.id === id)
    if (index !== -1) {
      workers[index] = { ...workers[index], ...data }
      setCollection(STORAGE_KEYS.WORKERS, workers)
      return workers[index]
    }
    return null
  },
  delete: (id: string) => {
    const workers = workersDb.getAll().filter(w => w.id !== id)
    setCollection(STORAGE_KEYS.WORKERS, workers)
  }
}

// Inventory
export const inventoryDb = {
  getAll: () => getCollection<InventoryItem>(STORAGE_KEYS.INVENTORY),
  getById: (id: string) => inventoryDb.getAll().find(i => i.id === id),
  create: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    const items = inventoryDb.getAll()
    const newItem: InventoryItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    items.push(newItem)
    setCollection(STORAGE_KEYS.INVENTORY, items)
    return newItem
  },
  update: (id: string, data: Partial<InventoryItem>) => {
    const items = inventoryDb.getAll()
    const index = items.findIndex(i => i.id === id)
    if (index !== -1) {
      items[index] = { ...items[index], ...data }
      setCollection(STORAGE_KEYS.INVENTORY, items)
      return items[index]
    }
    return null
  },
  delete: (id: string) => {
    const items = inventoryDb.getAll().filter(i => i.id !== id)
    setCollection(STORAGE_KEYS.INVENTORY, items)
  },
  updateQuantity: (id: string, quantity: number) => {
    return inventoryDb.update(id, { quantity })
  }
}

// BOQ
export const boqDb = {
  getAll: () => getCollection<BOQ>(STORAGE_KEYS.BOQS),
  getByProject: (projectId: string) => boqDb.getAll().filter(b => b.projectId === projectId),
  getById: (id: string) => boqDb.getAll().find(b => b.id === id),
  create: (boq: Omit<BOQ, 'id' | 'createdAt' | 'updatedAt'>) => {
    const boqs = boqDb.getAll()
    const newBoq: BOQ = {
      ...boq,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    boqs.push(newBoq)
    setCollection(STORAGE_KEYS.BOQS, boqs)
    return newBoq
  },
  update: (id: string, data: Partial<BOQ>) => {
    const boqs = boqDb.getAll()
    const index = boqs.findIndex(b => b.id === id)
    if (index !== -1) {
      boqs[index] = { ...boqs[index], ...data, updatedAt: new Date().toISOString() }
      setCollection(STORAGE_KEYS.BOQS, boqs)
      return boqs[index]
    }
    return null
  },
  delete: (id: string) => {
    const boqs = boqDb.getAll().filter(b => b.id !== id)
    setCollection(STORAGE_KEYS.BOQS, boqs)
  }
}

// Attendance
export const attendanceDb = {
  getAll: () => getCollection<AttendanceRecord>(STORAGE_KEYS.ATTENDANCE),
  getByWorker: (workerId: string) => attendanceDb.getAll().filter(a => a.workerId === workerId),
  getByDate: (date: string) => attendanceDb.getAll().filter(a => a.date === date),
  create: (record: Omit<AttendanceRecord, 'id'>) => {
    const records = attendanceDb.getAll()
    const newRecord: AttendanceRecord = { ...record, id: generateId() }
    records.push(newRecord)
    setCollection(STORAGE_KEYS.ATTENDANCE, records)
    return newRecord
  },
  update: (id: string, data: Partial<AttendanceRecord>) => {
    const records = attendanceDb.getAll()
    const index = records.findIndex(r => r.id === id)
    if (index !== -1) {
      records[index] = { ...records[index], ...data }
      setCollection(STORAGE_KEYS.ATTENDANCE, records)
      return records[index]
    }
    return null
  }
}

// Dashboard Stats
export const getDashboardStats = (): DashboardStats => {
  const projects = projectsDb.getAll()
  const workers = workersDb.getAll()
  const inventory = inventoryDb.getAll()

  return {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'in_progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalWorkers: workers.length,
    activeWorkers: workers.filter(w => w.status === 'active').length,
    totalInventory: inventory.length,
    lowStockItems: inventory.filter(i => i.minQuantity > 0 && i.quantity < i.minQuantity).length,
    totalRevenue: projects.reduce((sum, p) => sum + p.budget, 0),
    monthlyExpenses: workers.reduce((sum, w) => sum + (w.dailyRate * 26), 0)
  }
}

// Settings
export const settingsDb = {
  get: (): AppSettings => {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (!settings) {
      return {
        currency: 'USD',
        timezone: 'Asia/Bangkok',
        language: 'en',
        emailNotifications: true,
        pushNotifications: true,
        dailySummary: false,
        weeklyReport: true,
        theme: 'system',
        defaultProjectView: 'grid',
        autoSave: true,
        compactMode: false
      }
    }
    return JSON.parse(settings)
  },
  save: (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  }
}

// User Authentication (simplified)
export const authDb = {
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return user ? JSON.parse(user) : null
  },
  login: (email: string, password: string): User | null => {
    const users = getCollection<User>(STORAGE_KEYS.USERS)
    const user = users.find(u => u.email === email)
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
      return user
    }
    return null
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  },
  register: (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const users = getCollection<User>(STORAGE_KEYS.USERS)
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    users.push(newUser)
    setCollection(STORAGE_KEYS.USERS, users)
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser))
    return newUser
  }
}
