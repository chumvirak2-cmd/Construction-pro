import { Project, Worker, InventoryItem, InventoryCategory, BOQ, AttendanceRecord, PayrollRecord, PurchaseOrder, User, Company, AppSettings, DashboardStats, Subscription, SubscriptionPlan, SubscriptionTier, WorkerLocation, TrackingAlert, TeamMember, ManagerNotification, Permission, MANAGEMENT_LEVEL_PERMISSIONS } from '../types'

// Subscription Plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Basic',
    price: 29.99,
    yearlyPrice: 129,
    interval: 'month',
    limits: {
      maxProjects: 5,
      maxWorkers: 10,
      maxInventoryItems: 100,
      maxStorageMB: 100,
      maxUsers: 5,
      features: ['projects', 'workers', 'limited_inventory', 'basic_boq']
    },
    stripePriceIdMonthly: 'price_basic_monthly',
    stripePriceIdYearly: 'price_basic_yearly'
  },
  {
    id: 'professional',
    name: 'Pro',
    price: 599,
    yearlyPrice: 650,
    interval: 'month',
    limits: {
      maxProjects: 25,
      maxWorkers: 50,
      maxInventoryItems: 500,
      maxStorageMB: 500,
      maxUsers: 10,
      features: ['projects', 'workers', 'inventory', 'boq', 'reports', 'multi_user', 'advanced_analytics']
    },
    stripePriceIdMonthly: 'price_pro_monthly',
    stripePriceIdYearly: 'price_pro_yearly'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 899,
    yearlyPrice: 850,
    interval: 'month',
    limits: {
      maxProjects: -1,
      maxWorkers: -1,
      maxInventoryItems: -1,
      maxStorageMB: -1,
      maxUsers: -1,
      features: ['projects', 'workers', 'inventory', 'boq', 'reports', 'multi_user', 'api_access', 'priority_support', 'custom_branding', 'full_access']
    },
    stripePriceIdMonthly: 'price_enterprise_monthly',
    stripePriceIdYearly: 'price_enterprise_yearly'
  }
]

export const getPlan = (tier: SubscriptionTier): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(p => p.id === tier)
}

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
  COMPANIES: 'cp_companies',
  SETTINGS: 'cp_settings',
  CURRENT_USER: 'cp_current_user',
  SUBSCRIPTIONS: 'cp_subscriptions',
  WORKER_LOCATIONS: 'cp_worker_locations',
  TRACKING_ALERTS: 'cp_tracking_alerts',
  SITE_CONFIG: 'cp_site_config',
  TEAM_MEMBERS: 'cp_team_members',
  MANAGER_NOTIFICATIONS: 'cp_manager_notifications',
  CLIENTS: 'cp_clients'
}

// Metadata cache for counts (avoid re-parsing for stats)
const collectionMetadata: Record<string, { count: number; lastUpdated: number }> = {}

// Persistent cache for collections - stored in memory only
const collectionCache: Record<string, any[] | null> = {}

function getCollection<T>(key: string, limit?: number): T[] {
  if (typeof window === 'undefined') return []
  if (collectionCache[key]) {
    const cached = collectionCache[key] as T[]
    return limit ? cached.slice(0, limit) : cached
  }

  const data = localStorage.getItem(key)
  if (!data) {
    collectionCache[key] = []
    collectionMetadata[key] = { count: 0, lastUpdated: Date.now() }
    return []
  }
  try {
    const parsed = JSON.parse(data)
    collectionCache[key] = parsed
    collectionMetadata[key] = { count: parsed.length, lastUpdated: Date.now() }
    return limit ? parsed.slice(0, limit) : parsed
  } catch {
    collectionCache[key] = []
    collectionMetadata[key] = { count: 0, lastUpdated: Date.now() }
    return []
  }
}

function setCollection<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
  collectionCache[key] = data
}

function clearCollectionCache(key?: string) {
  if (key) {
    delete collectionCache[key]
  } else {
    Object.keys(collectionCache).forEach(k => delete collectionCache[k])
  }
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

// Payroll
export const payrollDb = {
  getAll: () => getCollection<PayrollRecord>(STORAGE_KEYS.PAYROLL),
  getByWorker: (workerId: string) => payrollDb.getAll().filter(p => p.workerId === workerId),
  getByMonth: (month: string) => payrollDb.getAll().filter(p => p.month === month),
  create: (record: Omit<PayrollRecord, 'id'>) => {
    const records = payrollDb.getAll()
    const newRecord: PayrollRecord = { ...record, id: generateId() }
    records.push(newRecord)
    setCollection(STORAGE_KEYS.PAYROLL, records)
    return newRecord
  },
  update: (id: string, data: Partial<PayrollRecord>) => {
    const records = payrollDb.getAll()
    const index = records.findIndex(r => r.id === id)
    if (index !== -1) {
      records[index] = { ...records[index], ...data }
      setCollection(STORAGE_KEYS.PAYROLL, records)
      return records[index]
    }
    return null
  }
}

// Purchase Orders
export const purchaseOrderDb = {
  getAll: () => getCollection<PurchaseOrder>(STORAGE_KEYS.PURCHASE_ORDERS),
  getBySupplier: (supplier: string) => purchaseOrderDb.getAll().filter(p => p.supplier === supplier),
  getByStatus: (status: PurchaseOrder['status']) => purchaseOrderDb.getAll().filter(p => p.status === status),
  create: (record: Omit<PurchaseOrder, 'id'>) => {
    const records = purchaseOrderDb.getAll()
    const newRecord: PurchaseOrder = {
      ...record,
      id: generateId()
    }
    records.push(newRecord)
    setCollection(STORAGE_KEYS.PURCHASE_ORDERS, records)
    return newRecord
  },
  update: (id: string, data: Partial<PurchaseOrder>) => {
    const records = purchaseOrderDb.getAll()
    const index = records.findIndex(r => r.id === id)
    if (index !== -1) {
      records[index] = { ...records[index], ...data }
      setCollection(STORAGE_KEYS.PURCHASE_ORDERS, records)
      return records[index]
    }
    return null
  },
  delete: (id: string) => {
    const records = purchaseOrderDb.getAll().filter(r => r.id !== id)
    setCollection(STORAGE_KEYS.PURCHASE_ORDERS, records)
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

export const getDashboardData = () => {
  const projects = projectsDb.getAll()
  const workers = workersDb.getAll()
  const inventory = inventoryDb.getAll()
  const boqs = boqDb.getAll()

  const stats: DashboardStats = {
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

  return {
    stats,
    recentProjects: projects.slice(-5).reverse(),
    recentWorkers: workers.slice(-5).reverse(),
    lowStockItems: inventory.filter(i => i.minQuantity > 0 && i.quantity < i.minQuantity).slice(0, 5),
    boqs: boqs.slice(-5).reverse()
  }
}

// Progressive dashboard data loading - Load critical data first, defer secondary data
export const getProgressiveDashboardData = async () => {
  const projects = projectsDb.getAll()
  const workers = workersDb.getAll()
  const inventory = inventoryDb.getAll()
  
  const stats = {
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
  
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return new Promise((resolve) => {
      ;(window as any).requestIdleCallback(() => {
        const boqs = boqDb.getAll()
        resolve({
          stats,
          recentProjects: projects.slice(-5).reverse(),
          recentWorkers: workers.slice(-5).reverse(),
          lowStockItems: inventory.filter(i => i.minQuantity > 0 && i.quantity < i.minQuantity).slice(0, 5),
          boqs: boqs.slice(-5).reverse()
        })
      }, { timeout: 1000 })
    })
  }
  
  const boqs = boqDb.getAll()
  return {
    stats,
    recentProjects: projects.slice(-5).reverse(),
    recentWorkers: workers.slice(-5).reverse(),
    lowStockItems: inventory.filter(i => i.minQuantity > 0 && i.quantity < i.minQuantity).slice(0, 5),
    boqs: boqs.slice(-5).reverse()
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

export interface SiteConfig {
  id: string
  name: string
  latitude: number
  longitude: number
  radiusMeters: number
  isActive: boolean
}

export const siteConfigDb = {
  get: (): SiteConfig | null => {
    const config = localStorage.getItem(STORAGE_KEYS.SITE_CONFIG)
    return config ? JSON.parse(config) : null
  },
  save: (config: Omit<SiteConfig, 'id'>) => {
    const newConfig: SiteConfig = { ...config, id: generateId() }
    localStorage.setItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(newConfig))
    return newConfig
  },
  update: (config: Partial<SiteConfig>) => {
    const existing = siteConfigDb.get()
    if (existing) {
      const updated = { ...existing, ...config }
      localStorage.setItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(updated))
      return updated
    }
    return null
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.SITE_CONFIG)
  }
}

// Worker Location Tracking
export const workerLocationDb = {
  getAll: () => getCollection<WorkerLocation>(STORAGE_KEYS.WORKER_LOCATIONS),
  getByPhone: (phone: string) => workerLocationDb.getAll().filter(l => l.phone === phone),
  getLatestByPhone: (phone: string) => {
    const locations = workerLocationDb.getByPhone(phone)
    if (locations.length === 0) return null
    return locations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  },
  create: (location: Omit<WorkerLocation, 'id' | 'distanceFromSite' | 'isOutsideSite'>, siteLat: number, siteLng: number, siteRadius: number) => {
    const locations = workerLocationDb.getAll()
    const distance = calculateHaversineDistance(location.latitude, location.longitude, siteLat, siteLng)
    const newLocation: WorkerLocation = {
      ...location,
      id: generateId(),
      distanceFromSite: Math.round(distance),
      isOutsideSite: distance > siteRadius
    }
    locations.push(newLocation)
    setCollection(STORAGE_KEYS.WORKER_LOCATIONS, locations)
    
    if (newLocation.isOutsideSite) {
      trackingAlertDb.createAlert(location.workerId, location.phone, location.latitude, location.longitude, distance)
      
      const workers = workersDb.getAll()
      const worker = workers.find(w => w.id === location.workerId)
      
      managerNotificationDb.create({
        type: 'geofence_violation',
        title: '⚠️ Worker Outside Site Boundary',
        message: `${worker?.name || 'Unknown worker'} (${worker?.role || 'Worker'}) is ${Math.round(distance)}m from site (limit: ${siteRadius}m)`,
        workerId: location.workerId,
        workerName: worker?.name
      })
    }
    
    return newLocation
  },
  getActiveWorkers: () => {
    const locations = workerLocationDb.getAll()
    const now = new Date()
    const activeWorkers = new Map<string, WorkerLocation>()
    
    locations.forEach(loc => {
      const locTime = new Date(loc.timestamp)
      const diffMinutes = (now.getTime() - locTime.getTime()) / (1000 * 60)
      if (diffMinutes < 30) {
        const existing = activeWorkers.get(loc.phone)
        if (!existing || new Date(loc.timestamp) > new Date(existing.timestamp)) {
          activeWorkers.set(loc.phone, loc)
        }
      }
    })
    
    return Array.from(activeWorkers.values())
  }
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// Tracking Alerts
export const trackingAlertDb = {
  getAll: () => getCollection<TrackingAlert>(STORAGE_KEYS.TRACKING_ALERTS),
  getActive: () => trackingAlertDb.getAll().filter(a => a.status === 'active'),
  createAlert: (workerId: string, phone: string, lat: number, lng: number, distance: number) => {
    const alerts = trackingAlertDb.getActive()
    const existingAlert = alerts.find(a => a.workerId === workerId && a.status === 'active')
    
    if (existingAlert) return existingAlert
    
    const workers = workersDb.getAll()
    const worker = workers.find(w => w.id === workerId)
    
    const newAlert: TrackingAlert = {
      id: generateId(),
      workerId,
      phone,
      workerName: worker?.name || 'Unknown',
      latitude: lat,
      longitude: lng,
      distanceFromSite: Math.round(distance),
      timestamp: new Date().toISOString(),
      status: 'active'
    }
    alerts.push(newAlert)
    setCollection(STORAGE_KEYS.TRACKING_ALERTS, alerts)
    return newAlert
  },
  resolveAlert: (id: string) => {
    const alerts = trackingAlertDb.getAll()
    const index = alerts.findIndex(a => a.id === id)
    if (index !== -1) {
      alerts[index] = { ...alerts[index], status: 'resolved', resolvedAt: new Date().toISOString() }
      setCollection(STORAGE_KEYS.TRACKING_ALERTS, alerts)
      return alerts[index]
    }
    return null
  },
  getByWorker: (workerId: string) => trackingAlertDb.getAll().filter(a => a.workerId === workerId)
}

// Manager Notifications
export const managerNotificationDb = {
  getAll: () => getCollection<ManagerNotification>(STORAGE_KEYS.MANAGER_NOTIFICATIONS),
  getUnread: () => managerNotificationDb.getAll().filter(n => !n.read),
  getByType: (type: ManagerNotification['type']) => managerNotificationDb.getAll().filter(n => n.type === type),
  create: (notification: Omit<ManagerNotification, 'id' | 'timestamp' | 'read'>) => {
    const notifications = managerNotificationDb.getAll()
    const newNotification: ManagerNotification = {
      ...notification,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false
    }
    notifications.push(newNotification)
    setCollection(STORAGE_KEYS.MANAGER_NOTIFICATIONS, notifications)
    
    if (typeof window !== 'undefined') {
      const settings = settingsDb.get()
      if (settings.pushNotifications && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          tag: newNotification.id
        })
      }
    }
    
    return newNotification
  },
  markAsRead: (id: string) => {
    const notifications = managerNotificationDb.getAll()
    const index = notifications.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications[index] = { ...notifications[index], read: true }
      setCollection(STORAGE_KEYS.MANAGER_NOTIFICATIONS, notifications)
      return notifications[index]
    }
    return null
  },
  markAllAsRead: () => {
    const notifications = managerNotificationDb.getAll()
    const updated = notifications.map(n => ({ ...n, read: true }))
    setCollection(STORAGE_KEYS.MANAGER_NOTIFICATIONS, updated)
    return updated
  },
  delete: (id: string) => {
    const notifications = managerNotificationDb.getAll().filter(n => n.id !== id)
    setCollection(STORAGE_KEYS.MANAGER_NOTIFICATIONS, notifications)
  },
  clearAll: () => {
    setCollection(STORAGE_KEYS.MANAGER_NOTIFICATIONS, [])
  }
}

// User Authentication (server-backed via MySQL API)
export const authDb = {
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return user ? JSON.parse(user) : null
  },
  async login(email: string, password: string): Promise<User | null> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    const user = data.user as User
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    return user
  },
  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  },
  async register(userData: Omit<User, 'id' | 'createdAt'> & { password?: string }): Promise<User | null> {
    const { password, ...rest } = userData

    const companyRes = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: rest.companyName || rest.companyId || 'My Company',
        email: rest.email,
        phone: rest.phone || '',
        address: ''
      })
    })

    if (!companyRes.ok) {
      return null
    }

    const company = await companyRes.json()

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: rest.email,
        password: password || '',
        fullName: rest.fullName,
        companyName: rest.companyName || company.name,
        phone: rest.phone,
        role: rest.role || 'admin',
        userType: rest.userType || 'company_admin',
        managementLevel: rest.managementLevel || 'company_admin',
        companyId: company.id,
        department: rest.department,
        permissions: rest.permissions || []
      })
    })

    if (!res.ok) {
      return null
    }

    const created = await res.json()
    const { password_hash, ...userForSession } = created
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userForSession))
    return userForSession as User
  },
  async getByEmail(email: string): Promise<User | null> {
    const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`)
    if (!res.ok) {
      return null
    }
    return (await res.json()) as User
  },
  async getById(id: string): Promise<User | null> {
    const res = await fetch(`/api/users?id=${encodeURIComponent(id)}`)
    if (!res.ok) {
      return null
    }
    return (await res.json()) as User
  },
  hasPermission(user: User | null, permission: string): boolean {
    if (!user) return false

    if (user.managementLevel === 'super_admin' || user.managementLevel === 'company_admin') {
      return true
    }

    if (user.permissions.includes(permission)) {
      return true
    }

    const levelPermissions = MANAGEMENT_LEVEL_PERMISSIONS[user.managementLevel]
    return levelPermissions?.includes(permission as Permission) || false
  },
  canAccessDepartment(user: User | null, department: string): boolean {
    if (!user) return false

    if (user.managementLevel === 'super_admin' || user.managementLevel === 'company_admin') {
      return true
    }

    return user.department === department
  }
}

// Company Database
export const companyDb = {
  getAll: () => getCollection<Company>(STORAGE_KEYS.COMPANIES),
  register: (companyData: Omit<Company, 'id' | 'createdAt'>): Company => {
    const companies = getCollection<Company>(STORAGE_KEYS.COMPANIES)
    const newCompany: Company = {
      ...companyData,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    companies.push(newCompany)
    setCollection(STORAGE_KEYS.COMPANIES, companies)
    return newCompany
  },
  findByEmail: (email: string): Company | null => {
    const companies = getCollection<Company>(STORAGE_KEYS.COMPANIES)
    return companies.find(c => 
      c.email === email || 
      (email.includes('@') && email.endsWith('@' + c.email.split('@')[1]))
    ) || null
  },
  findById: (id: string): Company | null => {
    const companies = getCollection<Company>(STORAGE_KEYS.COMPANIES)
    return companies.find(c => c.id === id) || null
  },
  update: (id: string, updates: Partial<Company>): Company | null => {
    const companies = getCollection<Company>(STORAGE_KEYS.COMPANIES)
    const index = companies.findIndex(c => c.id === id)
    if (index !== -1) {
      companies[index] = { ...companies[index], ...updates }
      setCollection(STORAGE_KEYS.COMPANIES, companies)
      return companies[index]
    }
    return null
  }
}

// Demo Mode Configuration
export const DEMO_MODE_KEY = 'cp_demo_mode'

export const demoDb = {
  isDemoMode: (): boolean => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(DEMO_MODE_KEY) === 'true'
  },
  enableDemoMode: (): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(DEMO_MODE_KEY, 'true')
  },
  disableDemoMode: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(DEMO_MODE_KEY)
  }
}

// Inline seed data (loaded only when needed)
const inlineSeedItems: Omit<InventoryItem, 'id' | 'createdAt'>[] = [
  { name: 'Portland Cement Type I', category: 'Concrete & Cement', unit: 'bags', quantity: 0, minQuantity: 20, unitPrice: 8, description: 'Portland cement 50kg bag' },
  { name: 'Ready-Mix Concrete 280', category: 'Concrete & Cement', unit: 'm³', quantity: 0, minQuantity: 0, unitPrice: 75, description: 'Ready-mix concrete grade 280 (C25)' },
  { name: 'Rebar DB12 (6m)', category: 'Steel & Metal', unit: 'pieces', quantity: 0, minQuantity: 50, unitPrice: 6, description: 'Deformed bar 12mm diameter x 6m' },
  { name: 'Main Switch Board (MSB)', category: 'Electrical', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 3500, description: 'Low voltage main switch board' },
  { name: 'PVC Conduit 20mm', category: 'Electrical', unit: 'pieces', quantity: 0, minQuantity: 50, unitPrice: 1.5, description: 'PVC conduit pipe 20mm x 3m' },
  { name: 'PPR Pipe 20mm', category: 'Plumbing', unit: 'pieces', quantity: 0, minQuantity: 20, unitPrice: 4, description: 'PPR hot water pipe 20mm x 4m' },
  { name: 'Water Tank 1000L', category: 'Plumbing', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 250, description: 'HDPE water storage tank 1000 liter' },
  { name: 'Split AC 12000 BTU', category: 'HVAC', unit: 'set', quantity: 0, minQuantity: 2, unitPrice: 550, description: 'Split type air conditioner 12000 BTU' },
]

// Seed data helpers
export const seedDataDb = {
  hasSeeded: (): boolean => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('cp_seeded') === 'true'
  },
  seedAll: async (): Promise<number> => {
    const allItems = inlineSeedItems
    const existing = inventoryDb.getAll()
    const existingNames = new Set(existing.map(i => i.name))
    let count = 0
    for (const item of allItems) {
      if (!existingNames.has(item.name)) {
        inventoryDb.create(item)
        count++
      }
    }
    localStorage.setItem('cp_seeded', 'true')
    return count
  },
  seedByCategory: async (category: InventoryCategory): Promise<number> => {
    const categoryItems = inlineSeedItems.filter((i) => i.category === category)
    const existing = inventoryDb.getAll()
    const existingNames = new Set(existing.map(i => i.name))
    let count = 0
    for (const item of categoryItems) {
      if (!existingNames.has(item.name)) {
        inventoryDb.create(item)
        count++
      }
    }
    return count
  },
  getAllSeedItems: () => Promise.resolve(inlineSeedItems)
}

// Team Members Management
export const teamDb = {
  getAll: (): TeamMember[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS)
    return data ? JSON.parse(data) : []
  },
  getByUserId: (userId: string): TeamMember[] => {
    return teamDb.getAll().filter(m => m.userId === userId)
  },
  getById: (id: string): TeamMember | undefined => {
    return teamDb.getAll().find(m => m.id === id)
  },
  create: (member: Omit<TeamMember, 'id'>): TeamMember => {
    const members = teamDb.getAll()
    const newMember: TeamMember = {
      ...member,
      id: generateId()
    }
    members.push(newMember)
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members))
    return newMember
  },
  update: (id: string, data: Partial<TeamMember>): boolean => {
    const members = teamDb.getAll()
    const index = members.findIndex(m => m.id === id)
    if (index === -1) return false
    members[index] = { ...members[index], ...data }
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members))
    return true
  },
  delete: (id: string): boolean => {
    const members = teamDb.getAll()
    const filtered = members.filter(m => m.id !== id)
    if (filtered.length === members.length) return false
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(filtered))
    return true
  },
  invite: (email: string, fullName: string, role: TeamMember['role'], permissions: string[], invitedBy: string): TeamMember => {
    const inviter = authDb.getById(invitedBy)
    const companyId = inviter?.companyId || ''
    
    return teamDb.create({
      userId: invitedBy,
      companyId,
      email,
      fullName,
      role,
      permissions,
      status: 'active',
      createdAt: new Date().toISOString(),
      invitedBy,
      isTrackingEnabled: false
    })
  }
}

// Subscriptions
export const subscriptionDb = {
  getAll: () => getCollection<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS),
  getByUserId: (userId: string) => subscriptionDb.getAll().find(s => s.userId === userId),
  getById: (id: string) => subscriptionDb.getAll().find(s => s.id === id),
  create: (subscription: Omit<Subscription, 'id'>): Subscription => {
    const subscriptions = subscriptionDb.getAll()
    const newSubscription: Subscription = {
      ...subscription,
      id: generateId()
    }
    subscriptions.push(newSubscription)
    setCollection(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions)
    return newSubscription
  },
  update: (id: string, data: Partial<Subscription>) => {
    const subscriptions = subscriptionDb.getAll()
    const index = subscriptions.findIndex(s => s.id === id)
    if (index !== -1) {
      subscriptions[index] = { ...subscriptions[index], ...data }
      setCollection(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions)
      return subscriptions[index]
    }
    return null
  },
  cancel: (id: string) => {
    return subscriptionDb.update(id, { cancelAtPeriodEnd: true })
  },
  delete: (id: string) => {
    const subscriptions = subscriptionDb.getAll().filter(s => s.id !== id)
    setCollection(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions)
  },
  hasActiveSubscription: (userId: string): boolean => {
    const sub = subscriptionDb.getByUserId(userId)
    if (!sub) return false
    const activeStatuses: Subscription['status'][] = ['active', 'trialing']
    return activeStatuses.includes(sub.status)
  },
  isSubscriptionValid: (userId: string): { valid: boolean; reason?: string } => {
    const sub = subscriptionDb.getByUserId(userId)
    if (!sub) return { valid: false, reason: 'no_subscription' }
    if (sub.status === 'canceled') return { valid: false, reason: 'subscription_canceled' }
    if (sub.status === 'past_due') return { valid: false, reason: 'payment_past_due' }
    if (sub.status === 'unpaid') return { valid: false, reason: 'payment_unpaid' }
    if (sub.status === 'active' || sub.status === 'trialing') {
      const endDate = new Date(sub.currentPeriodEnd)
      if (endDate < new Date()) return { valid: false, reason: 'subscription_expired' }
      return { valid: true }
    }
    return { valid: false, reason: 'invalid_subscription' }
  },
  checkLimits: (userId: string): { allowed: boolean; limitType?: string; current: number; limit: number } => {
    const user = authDb.getCurrentUser()
    if (!user) return { allowed: false, current: 0, limit: 0 }
    const sub = subscriptionDb.getByUserId(userId)
    if (!sub) return { allowed: false, current: 0, limit: 0 }
    const plan = getPlan(sub.tier)
    if (!plan) return { allowed: false, current: 0, limit: 0 }
    const projects = projectsDb.getAll().length
    const workers = workersDb.getAll().length
    const inventory = inventoryDb.getAll().length
    if (plan.limits.maxProjects > 0 && projects >= plan.limits.maxProjects) {
      return { allowed: false, limitType: 'projects', current: projects, limit: plan.limits.maxProjects }
    }
    if (plan.limits.maxWorkers > 0 && workers >= plan.limits.maxWorkers) {
      return { allowed: false, limitType: 'workers', current: workers, limit: plan.limits.maxWorkers }
    }
    if (plan.limits.maxInventoryItems > 0 && inventory >= plan.limits.maxInventoryItems) {
      return { allowed: false, limitType: 'inventory', current: inventory, limit: plan.limits.maxInventoryItems }
    }
    return { allowed: true, current: projects, limit: plan.limits.maxProjects }
  }
}

// Clients Database
export const clientsDb = {
  getAll: () => getCollection<Client>(STORAGE_KEYS.CLIENTS),
  getById: (id: string) => clientsDb.getAll().find(c => c.id === id),
  create: (client: Omit<Client, 'id' | 'createdAt'>) => {
    const clients = clientsDb.getAll()
    const newClient: Client = {
      ...client,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    clients.push(newClient)
    setCollection(STORAGE_KEYS.CLIENTS, clients)
    return newClient
  },
  update: (id: string, data: Partial<Client>) => {
    const clients = clientsDb.getAll()
    const index = clients.findIndex(c => c.id === id)
    if (index !== -1) {
      clients[index] = { ...clients[index], ...data, updatedAt: new Date().toISOString() }
      setCollection(STORAGE_KEYS.CLIENTS, clients)
      return clients[index]
    }
    return null
  },
  delete: (id: string) => {
    const clients = clientsDb.getAll().filter(c => c.id !== id)
    setCollection(STORAGE_KEYS.CLIENTS, clients)
  }
}

// Types
export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  company?: string
  contactPerson?: string
  status?: 'active' | 'inactive' | 'lead'
  notes?: string
  createdAt: string
  updatedAt?: string
}