import { Project, Worker, InventoryItem, InventoryCategory, BOQ, AttendanceRecord, PayrollRecord, PurchaseOrder, User, AppSettings, DashboardStats, Subscription, SubscriptionPlan, SubscriptionTier, WorkerLocation, TrackingAlert, TeamMember } from '../types'

// Subscription Plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Basic',
    price: 79,
    interval: 'month',
    limits: {
      maxProjects: 5,
      maxWorkers: 10,
      maxInventoryItems: 100,
      maxStorageMB: 100,
      maxUsers: 5,
      features: ['projects', 'workers', 'limited_inventory', 'basic_boq']
    },
    stripePriceId: 'price_starter_monthly'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 199,
    interval: 'month',
    limits: {
      maxProjects: 25,
      maxWorkers: 50,
      maxInventoryItems: 500,
      maxStorageMB: 500,
      maxUsers: 10,
      features: ['projects', 'workers', 'inventory', 'boq', 'reports', 'multi_user']
    },
    stripePriceId: 'price_professional_monthly'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 799,
    interval: 'month',
    limits: {
      maxProjects: -1,
      maxWorkers: -1,
      maxInventoryItems: -1,
      maxStorageMB: -1,
      maxUsers: -1,
      features: ['projects', 'workers', 'inventory', 'boq', 'reports', 'multi_user', 'api_access', 'priority_support', 'custom_branding']
    },
    stripePriceId: 'price_enterprise_monthly'
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
  SETTINGS: 'cp_settings',
  CURRENT_USER: 'cp_current_user',
  SUBSCRIPTIONS: 'cp_subscriptions',
  WORKER_LOCATIONS: 'cp_worker_locations',
  TRACKING_ALERTS: 'cp_tracking_alerts',
  SITE_CONFIG: 'cp_site_config',
  TEAM_MEMBERS: 'cp_team_members'
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

// Seed Data - MEP System Items
const mepElectricalItems: Omit<InventoryItem, 'id' | 'createdAt'>[] = [
  { name: 'Main Switch Board (MSB)', category: 'Electrical', subCategory: 'Main Switch Board', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 3500, description: 'Low voltage main switch board' },
  { name: 'Distribution Board (DB)', category: 'Electrical', subCategory: 'Distribution Board', unit: 'set', quantity: 0, minQuantity: 2, unitPrice: 450, description: 'Distribution board 12-way' },
  { name: 'MCB 32A 3P', category: 'Electrical', subCategory: 'Circuit Breaker', unit: 'pieces', quantity: 0, minQuantity: 10, unitPrice: 15, description: 'Miniature circuit breaker 32A 3-pole' },
  { name: 'MCB 20A 1P', category: 'Electrical', subCategory: 'Circuit Breaker', unit: 'pieces', quantity: 0, minQuantity: 20, unitPrice: 5, description: 'Miniature circuit breaker 20A 1-pole' },
  { name: 'RCCB 40A 30mA', category: 'Electrical', subCategory: 'Circuit Breaker', unit: 'pieces', quantity: 0, minQuantity: 5, unitPrice: 25, description: 'Residual current circuit breaker' },
  { name: 'Cable THW 2.5mm²', category: 'Electrical', subCategory: 'Cable/Wiring', unit: 'rolls', quantity: 0, minQuantity: 5, unitPrice: 85, description: 'Single core THW cable 2.5mm² 100m/roll' },
  { name: 'Cable THW 4mm²', category: 'Electrical', subCategory: 'Cable/Wiring', unit: 'rolls', quantity: 0, minQuantity: 5, unitPrice: 120, description: 'Single core THW cable 4mm² 100m/roll' },
  { name: 'Cable THW 10mm²', category: 'Electrical', subCategory: 'Cable/Wiring', unit: 'rolls', quantity: 0, minQuantity: 3, unitPrice: 280, description: 'Single core THW cable 10mm² 100m/roll' },
  { name: 'Cable THW 16mm²', category: 'Electrical', subCategory: 'Cable/Wiring', unit: 'rolls', quantity: 0, minQuantity: 2, unitPrice: 420, description: 'Single core THW cable 16mm² 100m/roll' },
  { name: 'PVC Conduit 20mm', category: 'Electrical', subCategory: 'Conduit & Trunking', unit: 'pieces', quantity: 0, minQuantity: 50, unitPrice: 1.5, description: 'PVC conduit pipe 20mm x 3m' },
  { name: 'PVC Conduit 25mm', category: 'Electrical', subCategory: 'Conduit & Trunking', unit: 'pieces', quantity: 0, minQuantity: 30, unitPrice: 2, description: 'PVC conduit pipe 25mm x 3m' },
  { name: 'Trunking 50x25mm', category: 'Electrical', subCategory: 'Conduit & Trunking', unit: 'pieces', quantity: 0, minQuantity: 20, unitPrice: 4, description: 'PVC trunking 50x25mm x 2m' },
  { name: 'LED Panel Light 600x600', category: 'Electrical', subCategory: 'Lighting', unit: 'pieces', quantity: 0, minQuantity: 10, unitPrice: 35, description: 'LED panel light 40W 600x600mm' },
  { name: 'LED Downlight 10W', category: 'Electrical', subCategory: 'Lighting', unit: 'pieces', quantity: 0, minQuantity: 20, unitPrice: 8, description: 'LED recessed downlight 10W' },
  { name: 'LED Floodlight 50W', category: 'Electrical', subCategory: 'Lighting', unit: 'pieces', quantity: 0, minQuantity: 5, unitPrice: 25, description: 'LED floodlight 50W IP65' },
  { name: 'Single Switch Socket', category: 'Electrical', subCategory: 'Switches & Sockets', unit: 'pieces', quantity: 0, minQuantity: 30, unitPrice: 4, description: 'Single switched socket outlet' },
  { name: 'Double Switch Socket', category: 'Electrical', subCategory: 'Switches & Sockets', unit: 'pieces', quantity: 0, minQuantity: 20, unitPrice: 6, description: 'Double switched socket outlet' },
  { name: 'Light Switch 1-Gang', category: 'Electrical', subCategory: 'Switches & Sockets', unit: 'pieces', quantity: 0, minQuantity: 20, unitPrice: 3, description: 'One gang one way switch' },
  { name: 'Light Switch 2-Gang', category: 'Electrical', subCategory: 'Switches & Sockets', unit: 'pieces', quantity: 0, minQuantity: 15, unitPrice: 4, description: 'Two gang one way switch' },
  { name: 'Generator 100kVA', category: 'Electrical', subCategory: 'Generator', unit: 'set', quantity: 0, minQuantity: 0, unitPrice: 15000, description: 'Diesel generator 100kVA standby' },
  { name: 'UPS 3kVA', category: 'Electrical', subCategory: 'UPS', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 800, description: 'Online UPS 3kVA rack mount' },
]

const mepPlumbingItems: Omit<InventoryItem, 'id' | 'createdAt'>[] = [
  { name: 'PPR Pipe 20mm', category: 'Plumbing', subCategory: 'Piping (PPR/PVC)', unit: 'pieces', quantity: 0, minQuantity: 20, unitPrice: 4, description: 'PPR hot water pipe 20mm x 4m' },
  { name: 'PPR Pipe 25mm', category: 'Plumbing', subCategory: 'Piping (PPR/PVC)', unit: 'pieces', quantity: 0, minQuantity: 15, unitPrice: 6, description: 'PPR hot water pipe 25mm x 4m' },
  { name: 'PPR Pipe 32mm', category: 'Plumbing', subCategory: 'Piping (PPR/PVC)', unit: 'pieces', quantity: 0, minQuantity: 10, unitPrice: 9, description: 'PPR hot water pipe 32mm x 4m' },
  { name: 'PVC Pipe 4" (110mm)', category: 'Plumbing', subCategory: 'Piping (PPR/PVC)', unit: 'pieces', quantity: 0, minQuantity: 10, unitPrice: 8, description: 'PVC drain pipe 110mm x 6m' },
  { name: 'PVC Pipe 2" (50mm)', category: 'Plumbing', subCategory: 'Piping (PPR/PVC)', unit: 'pieces', quantity: 0, minQuantity: 15, unitPrice: 3, description: 'PVC drain pipe 50mm x 6m' },
  { name: 'Gate Valve 25mm', category: 'Plumbing', subCategory: 'Valve', unit: 'pieces', quantity: 0, minQuantity: 10, unitPrice: 12, description: 'Brass gate valve 25mm' },
  { name: 'Ball Valve 20mm', category: 'Plumbing', subCategory: 'Valve', unit: 'pieces', quantity: 0, minQuantity: 10, unitPrice: 8, description: 'Brass ball valve 20mm' },
  { name: 'Check Valve 25mm', category: 'Plumbing', subCategory: 'Valve', unit: 'pieces', quantity: 0, minQuantity: 5, unitPrice: 15, description: 'Non-return valve 25mm' },
  { name: 'Water Tank 1000L', category: 'Plumbing', subCategory: 'Water Tank', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 250, description: 'HDPE water storage tank 1000 liter' },
  { name: 'Water Tank 2000L', category: 'Plumbing', subCategory: 'Water Tank', unit: 'set', quantity: 0, minQuantity: 0, unitPrice: 400, description: 'HDPE water storage tank 2000 liter' },
  { name: 'Water Pump 1HP', category: 'Plumbing', subCategory: 'Water Pump', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 180, description: 'Centrifugal water pump 1HP' },
  { name: 'Pressure Pump 1.5HP', category: 'Plumbing', subCategory: 'Water Pump', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 320, description: 'Automatic pressure pump 1.5HP' },
  { name: 'Water Heater 20L', category: 'Plumbing', subCategory: 'Hot Water System', unit: 'set', quantity: 0, minQuantity: 2, unitPrice: 150, description: 'Electric water heater 20 liter' },
  { name: 'WC Complete Set', category: 'Plumbing', subCategory: 'Sanitary Fixture', unit: 'set', quantity: 0, minQuantity: 2, unitPrice: 120, description: 'Water closet with tank and seat' },
  { name: 'Wash Basin', category: 'Plumbing', subCategory: 'Sanitary Fixture', unit: 'set', quantity: 0, minQuantity: 2, unitPrice: 60, description: 'Ceramic wash basin with pedestal' },
  { name: 'Shower Set', category: 'Plumbing', subCategory: 'Sanitary Fixture', unit: 'set', quantity: 0, minQuantity: 2, unitPrice: 80, description: 'Shower mixer set with head' },
  { name: 'Kitchen Faucet', category: 'Plumbing', subCategory: 'Sanitary Fixture', unit: 'pieces', quantity: 0, minQuantity: 2, unitPrice: 45, description: 'Single lever kitchen faucet' },
  { name: 'Floor Drain 4"', category: 'Plumbing', subCategory: 'Drainage System', unit: 'pieces', quantity: 0, minQuantity: 10, unitPrice: 5, description: 'Stainless steel floor drain 4 inch' },
  { name: 'Sump Pump', category: 'Plumbing', subCategory: 'Water Pump', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 250, description: 'Submersible sump pump 0.5HP' },
]

const mepHVACItems: Omit<InventoryItem, 'id' | 'createdAt'>[] = [
  { name: 'Split AC 9000 BTU', category: 'HVAC', subCategory: 'Split Unit AC', unit: 'set', quantity: 0, minQuantity: 2, unitPrice: 450, description: 'Split type air conditioner 9000 BTU' },
  { name: 'Split AC 12000 BTU', category: 'HVAC', subCategory: 'Split Unit AC', unit: 'set', quantity: 0, minQuantity: 2, unitPrice: 550, description: 'Split type air conditioner 12000 BTU' },
  { name: 'Split AC 18000 BTU', category: 'HVAC', subCategory: 'Split Unit AC', unit: 'set', quantity: 0, minQuantity: 2, unitPrice: 750, description: 'Split type air conditioner 18000 BTU' },
  { name: 'Split AC 24000 BTU', category: 'HVAC', subCategory: 'Split Unit AC', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 1100, description: 'Split type air conditioner 24000 BTU' },
  { name: 'Ceiling Cassette 36000 BTU', category: 'HVAC', subCategory: 'Central AC', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 2200, description: 'Ceiling cassette AC 36000 BTU' },
  { name: 'VRF Outdoor Unit 10HP', category: 'HVAC', subCategory: 'VRF System', unit: 'set', quantity: 0, minQuantity: 0, unitPrice: 8500, description: 'VRF outdoor unit 10HP' },
  { name: 'Exhaust Fan 10"', category: 'HVAC', subCategory: 'Exhaust Fan', unit: 'pieces', quantity: 0, minQuantity: 5, unitPrice: 25, description: 'Wall exhaust fan 10 inch' },
  { name: 'Exhaust Fan 12"', category: 'HVAC', subCategory: 'Exhaust Fan', unit: 'pieces', quantity: 0, minQuantity: 5, unitPrice: 35, description: 'Wall exhaust fan 12 inch' },
  { name: 'Ceiling Exhaust Fan', category: 'HVAC', subCategory: 'Exhaust Fan', unit: 'pieces', quantity: 0, minQuantity: 5, unitPrice: 30, description: 'Ceiling mounted exhaust fan with light' },
  { name: 'Flexible Duct 6"', category: 'HVAC', subCategory: 'Ventilation Duct', unit: 'rolls', quantity: 0, minQuantity: 3, unitPrice: 45, description: 'Flexible aluminum duct 6 inch x 10m' },
  { name: 'Duct Insulation 1"', category: 'HVAC', subCategory: 'Insulation', unit: 'rolls', quantity: 0, minQuantity: 5, unitPrice: 60, description: 'NBR foam insulation 1 inch x 1.5m x 50m' },
  { name: 'Pipe Insulation 3/4"', category: 'HVAC', subCategory: 'Insulation', unit: 'rolls', quantity: 0, minQuantity: 5, unitPrice: 35, description: 'NBR foam pipe insulation 3/4 inch x 2m' },
  { name: 'Copper Pipe 3/8"', category: 'HVAC', subCategory: 'Ventilation Duct', unit: 'pieces', quantity: 0, minQuantity: 10, unitPrice: 12, description: 'Copper pipe 3/8 inch x 15m coil' },
  { name: 'Copper Pipe 1/2"', category: 'HVAC', subCategory: 'Ventilation Duct', unit: 'pieces', quantity: 0, minQuantity: 10, unitPrice: 18, description: 'Copper pipe 1/2 inch x 15m coil' },
  { name: 'Copper Pipe 5/8"', category: 'HVAC', subCategory: 'Ventilation Duct', unit: 'pieces', quantity: 0, minQuantity: 5, unitPrice: 25, description: 'Copper pipe 5/8 inch x 15m coil' },
]

const mepELVItems: Omit<InventoryItem, 'id' | 'createdAt'>[] = [
  { name: 'IP Camera 2MP', category: 'ELV', subCategory: 'CCTV', unit: 'pieces', quantity: 0, minQuantity: 4, unitPrice: 65, description: 'Network IP camera 2MP IR 30m' },
  { name: 'IP Camera 4MP', category: 'ELV', subCategory: 'CCTV', unit: 'pieces', quantity: 0, minQuantity: 4, unitPrice: 95, description: 'Network IP camera 4MP IR 50m' },
  { name: 'NVR 8-Channel', category: 'ELV', subCategory: 'CCTV', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 280, description: 'Network video recorder 8-channel' },
  { name: 'NVR 16-Channel', category: 'ELV', subCategory: 'CCTV', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 450, description: 'Network video recorder 16-channel' },
  { name: 'HDD 4TB Surveillance', category: 'ELV', subCategory: 'CCTV', unit: 'pieces', quantity: 0, minQuantity: 2, unitPrice: 120, description: 'Surveillance hard drive 4TB' },
  { name: 'Access Control Reader', category: 'ELV', subCategory: 'Access Control', unit: 'pieces', quantity: 0, minQuantity: 2, unitPrice: 150, description: 'RFID card reader for door access' },
  { name: 'Electric Door Lock', category: 'ELV', subCategory: 'Access Control', unit: 'pieces', quantity: 0, minQuantity: 2, unitPrice: 85, description: 'Magnetic lock 280kg holding force' },
  { name: 'Cat6 Cable UTP', category: 'ELV', subCategory: 'Data Network', unit: 'rolls', quantity: 0, minQuantity: 3, unitPrice: 95, description: 'Cat6 UTP cable 305m/roll' },
  { name: 'Cat6 Patch Panel 24P', category: 'ELV', subCategory: 'Data Network', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 45, description: '24 port Cat6 patch panel' },
  { name: 'Network Switch 8P', category: 'ELV', subCategory: 'Data Network', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 55, description: '8-port gigabit network switch' },
  { name: 'Network Switch 24P PoE', category: 'ELV', subCategory: 'Data Network', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 280, description: '24-port PoE managed switch' },
  { name: 'Wall Mount Rack 12U', category: 'ELV', subCategory: 'Data Network', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 85, description: 'Wall mount server rack 12U' },
  { name: 'PA Speaker 6W', category: 'ELV', subCategory: 'PA System', unit: 'pieces', quantity: 0, minQuantity: 5, unitPrice: 18, description: 'Ceiling speaker 6W for PA system' },
  { name: 'Fire Alarm Panel 2-Zone', category: 'Fire Protection', subCategory: 'Fire Alarm System', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 350, description: 'Conventional fire alarm panel 2-zone' },
  { name: 'Smoke Detector', category: 'Fire Protection', subCategory: 'Smoke Detector', unit: 'pieces', quantity: 0, minQuantity: 10, unitPrice: 20, description: 'Conventional smoke detector' },
  { name: 'Heat Detector', category: 'Fire Protection', subCategory: 'Smoke Detector', unit: 'pieces', quantity: 0, minQuantity: 5, unitPrice: 22, description: 'Fixed temperature heat detector' },
  { name: 'Fire Extinguisher 4kg ABC', category: 'Fire Protection', subCategory: 'Fire Extinguisher', unit: 'pieces', quantity: 0, minQuantity: 5, unitPrice: 35, description: 'Dry powder fire extinguisher 4kg' },
  { name: 'Fire Extinguisher 9kg ABC', category: 'Fire Protection', subCategory: 'Fire Extinguisher', unit: 'pieces', quantity: 0, minQuantity: 3, unitPrice: 55, description: 'Dry powder fire extinguisher 9kg' },
  { name: 'Fire Hose Cabinet', category: 'Fire Protection', subCategory: 'Fire Hydrant', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 250, description: 'Fire hose cabinet with hose reel' },
]

const buildingMaterialItems: Omit<InventoryItem, 'id' | 'createdAt'>[] = [
  // Concrete & Cement
  { name: 'Portland Cement Type I', category: 'Concrete & Cement', unit: 'bags', quantity: 0, minQuantity: 20, unitPrice: 8, description: 'Portland cement 50kg bag' },
  { name: 'Ready-Mix Concrete 210', category: 'Concrete & Cement', unit: 'm³', quantity: 0, minQuantity: 0, unitPrice: 65, description: 'Ready-mix concrete grade 210 (C18)' },
  { name: 'Ready-Mix Concrete 280', category: 'Concrete & Cement', unit: 'm³', quantity: 0, minQuantity: 0, unitPrice: 75, description: 'Ready-mix concrete grade 280 (C25)' },
  { name: 'Ready-Mix Concrete 350', category: 'Concrete & Cement', unit: 'm³', quantity: 0, minQuantity: 0, unitPrice: 85, description: 'Ready-mix concrete grade 350 (C30)' },
  // Steel & Metal
  { name: 'Rebar DB10 (6m)', category: 'Steel & Metal', unit: 'pieces', quantity: 0, minQuantity: 50, unitPrice: 4, description: 'Deformed bar 10mm diameter x 6m' },
  { name: 'Rebar DB12 (6m)', category: 'Steel & Metal', unit: 'pieces', quantity: 0, minQuantity: 50, unitPrice: 6, description: 'Deformed bar 12mm diameter x 6m' },
  { name: 'Rebar DB16 (6m)', category: 'Steel & Metal', unit: 'pieces', quantity: 0, minQuantity: 30, unitPrice: 9, description: 'Deformed bar 16mm diameter x 6m' },
  { name: 'Rebar DB20 (6m)', category: 'Steel & Metal', unit: 'pieces', quantity: 0, minQuantity: 20, unitPrice: 14, description: 'Deformed bar 20mm diameter x 6m' },
  { name: 'Rebar DB25 (6m)', category: 'Steel & Metal', unit: 'pieces', quantity: 0, minQuantity: 10, unitPrice: 22, description: 'Deformed bar 25mm diameter x 6m' },
  { name: 'Wire Mesh 2.4x6m', category: 'Steel & Metal', unit: 'sheets', quantity: 0, minQuantity: 20, unitPrice: 12, description: 'Welded wire mesh 4mm spacing 200mm' },
  { name: 'Wire Tie (Bundle)', category: 'Steel & Metal', unit: 'kg', quantity: 0, minQuantity: 10, unitPrice: 2.5, description: 'Annealed binding wire tie 1.2mm' },
  { name: 'Steel I-Beam 150x75mm', category: 'Steel & Metal', unit: 'pieces', quantity: 0, minQuantity: 5, unitPrice: 120, description: 'I-beam 150x75mm x 6m' },
  { name: 'Steel H-Beam 200x200mm', category: 'Steel & Metal', unit: 'pieces', quantity: 0, minQuantity: 2, unitPrice: 250, description: 'H-beam 200x200mm x 6m' },
  { name: 'Metal Sheet Roofing 0.35mm', category: 'Steel & Metal', unit: 'sheets', quantity: 0, minQuantity: 20, unitPrice: 15, description: 'Galvanized roofing sheet 0.35mm x 3m' },
  { name: 'L-Bracket Steel', category: 'Steel & Metal', unit: 'pieces', quantity: 0, minQuantity: 20, unitPrice: 2, description: 'Galvanized L-bracket 50x50mm' },
  // Sand & Aggregate
  { name: 'River Sand (Truck)', category: 'Sand & Aggregate', unit: 'm³', quantity: 0, minQuantity: 0, unitPrice: 30, description: 'Fine river sand per cubic meter' },
  { name: 'Coarse Aggregate 3/4"', category: 'Sand & Aggregate', unit: 'm³', quantity: 0, minQuantity: 0, unitPrice: 35, description: 'Crushed stone aggregate 20mm per cubic meter' },
  { name: 'Fine Aggregate 3/8"', category: 'Sand & Aggregate', unit: 'm³', quantity: 0, minQuantity: 0, unitPrice: 32, description: 'Crushed stone aggregate 10mm per cubic meter' },
  { name: 'Red Clay Soil', category: 'Sand & Aggregate', unit: 'm³', quantity: 0, minQuantity: 0, unitPrice: 20, description: 'Red clay soil for backfill' },
  // Bricks & Blocks
  { name: 'Concrete Block 7x14x29cm', category: 'Bricks & Blocks', unit: 'pieces', quantity: 0, minQuantity: 100, unitPrice: 0.8, description: 'Hollow concrete block 7cm' },
  { name: 'Concrete Block 10x19x39cm', category: 'Bricks & Blocks', unit: 'pieces', quantity: 0, minQuantity: 100, unitPrice: 1.2, description: 'Hollow concrete block 10cm' },
  { name: 'Concrete Block 15x19x39cm', category: 'Bricks & Blocks', unit: 'pieces', quantity: 0, minQuantity: 100, unitPrice: 1.5, description: 'Hollow concrete block 15cm' },
  { name: 'Solid Block 10x19x39cm', category: 'Bricks & Blocks', unit: 'pieces', quantity: 0, minQuantity: 50, unitPrice: 1.8, description: 'Solid concrete block 10cm' },
  { name: 'Red Clay Brick', category: 'Bricks & Blocks', unit: 'pieces', quantity: 0, minQuantity: 100, unitPrice: 0.3, description: 'Standard red clay brick' },
  { name: 'AAC Block 10x20x60cm', category: 'Bricks & Blocks', unit: 'pieces', quantity: 0, minQuantity: 50, unitPrice: 3.5, description: 'Autoclaved aerated concrete block 10cm' },
  // Wood & Timber
  { name: 'Pine Timber 2x4" (4m)', category: 'Wood & Timber', unit: 'pieces', quantity: 0, minQuantity: 10, unitPrice: 12, description: 'Sawn pine timber 2x4 inch x 4m' },
  { name: 'Pine Timber 2x6" (4m)', category: 'Wood & Timber', unit: 'pieces', quantity: 0, minQuantity: 10, unitPrice: 18, description: 'Sawn pine timber 2x6 inch x 4m' },
  { name: 'Plywood 12mm 4x8ft', category: 'Wood & Timber', unit: 'sheets', quantity: 0, minQuantity: 10, unitPrice: 22, description: 'Structural plywood 12mm 1220x2440mm' },
  { name: 'Plywood 18mm 4x8ft', category: 'Wood & Timber', unit: 'sheets', quantity: 0, minQuantity: 5, unitPrice: 32, description: 'Structural plywood 18mm 1220x2440mm' },
  { name: 'Formwork Plywood 12mm', category: 'Wood & Timber', unit: 'sheets', quantity: 0, minQuantity: 20, unitPrice: 18, description: 'Concrete formwork plywood 12mm' },
  { name: 'Wood Plank 1x10" (4m)', category: 'Wood & Timber', unit: 'pieces', quantity: 0, minQuantity: 10, unitPrice: 10, description: 'Sawn wood plank 1x10 inch x 4m' },
  // Roofing
  { name: 'Concrete Roof Tile', category: 'Roofing', unit: 'pieces', quantity: 0, minQuantity: 100, unitPrice: 1.8, description: 'Concrete roof tile standard color' },
  { name: 'Ridge Cap Tile', category: 'Roofing', unit: 'pieces', quantity: 0, minQuantity: 10, unitPrice: 3, description: 'Concrete ridge cap tile' },
  { name: 'Roof Felt Underlayment', category: 'Roofing', unit: 'rolls', quantity: 0, minQuantity: 3, unitPrice: 45, description: 'Bituminous roofing felt 40m²/roll' },
  { name: 'Fiber Cement Sheet 6mm', category: 'Roofing', unit: 'sheets', quantity: 0, minQuantity: 10, unitPrice: 12, description: 'Fiber cement flat sheet 6mm 1220x2440mm' },
  { name: 'Ridge Ventilator', category: 'Roofing', unit: 'pieces', quantity: 0, minQuantity: 5, unitPrice: 8, description: 'Plastic ridge ventilator 600mm' },
  // Doors & Windows
  { name: 'Steel Door Frame (Single)', category: 'Doors & Windows', unit: 'set', quantity: 0, minQuantity: 2, unitPrice: 45, description: 'Galvanized steel door frame single leaf' },
  { name: 'Steel Door Frame (Double)', category: 'Doors & Windows', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 75, description: 'Galvanized steel door frame double leaf' },
  { name: 'Wooden Door Panel', category: 'Doors & Windows', unit: 'pieces', quantity: 0, minQuantity: 5, unitPrice: 80, description: 'Solid wood door panel 900x2100mm' },
  { name: 'Aluminum Window Frame', category: 'Doors & Windows', unit: 'set', quantity: 0, minQuantity: 5, unitPrice: 120, description: 'Aluminum sliding window frame 1.2x1.2m' },
  { name: 'Aluminum Casement Window', category: 'Doors & Windows', unit: 'set', quantity: 0, minQuantity: 3, unitPrice: 150, description: 'Aluminum casement window 1.2x1.2m' },
  { name: 'Safety Glass 6mm', category: 'Glass & Glazing', unit: 'm²', quantity: 0, minQuantity: 5, unitPrice: 25, description: 'Tempered safety glass 6mm' },
  { name: 'Clear Glass 5mm', category: 'Glass & Glazing', unit: 'm²', quantity: 0, minQuantity: 5, unitPrice: 18, description: 'Clear float glass 5mm' },
  // Tiles & Flooring
  { name: 'Ceramic Floor Tile 60x60cm', category: 'Tiles & Flooring', unit: 'm²', quantity: 0, minQuantity: 20, unitPrice: 12, description: 'Ceramic floor tile 60x60cm' },
  { name: 'Ceramic Wall Tile 30x60cm', category: 'Tiles & Flooring', unit: 'm²', quantity: 0, minQuantity: 15, unitPrice: 10, description: 'Ceramic wall tile 30x60cm' },
  { name: 'Porcelain Tile 60x60cm', category: 'Tiles & Flooring', unit: 'm²', quantity: 0, minQuantity: 10, unitPrice: 22, description: 'Polished porcelain tile 60x60cm' },
  { name: 'Tile Adhesive 20kg', category: 'Tiles & Flooring', unit: 'bags', quantity: 0, minQuantity: 10, unitPrice: 8, description: 'Tile adhesive powder 20kg bag' },
  { name: 'Tile Grout 5kg', category: 'Tiles & Flooring', unit: 'bags', quantity: 0, minQuantity: 5, unitPrice: 6, description: 'Tile grout 5kg bag' },
  { name: 'Screed Mix 40kg', category: 'Tiles & Flooring', unit: 'bags', quantity: 0, minQuantity: 10, unitPrice: 5, description: 'Floor screed mix 40kg' },
  // Paint & Coating
  { name: 'Interior Paint 5L', category: 'Paint & Coating', unit: 'buckets', quantity: 0, minQuantity: 5, unitPrice: 25, description: 'Interior wall paint 5 liter' },
  { name: 'Exterior Paint 5L', category: 'Paint & Coating', unit: 'buckets', quantity: 0, minQuantity: 5, unitPrice: 30, description: 'Exterior weatherproof paint 5 liter' },
  { name: 'Primer Sealer 5L', category: 'Paint & Coating', unit: 'buckets', quantity: 0, minQuantity: 3, unitPrice: 20, description: 'Wall primer sealer 5 liter' },
  { name: 'Waterproof Coating 5L', category: 'Paint & Coating', unit: 'buckets', quantity: 0, minQuantity: 3, unitPrice: 35, description: 'Liquid waterproof membrane 5 liter' },
  { name: 'Emulsion Paint 5L', category: 'Paint & Coating', unit: 'buckets', quantity: 0, minQuantity: 5, unitPrice: 18, description: 'Water-based emulsion paint 5 liter' },
  // Insulation
  { name: 'Fiberglass Insulation 50mm', category: 'Insulation', unit: 'rolls', quantity: 0, minQuantity: 5, unitPrice: 55, description: 'Fiberglass roll insulation 50mm 6m²/roll' },
  { name: 'Roof Insulation 10mm', category: 'Insulation', unit: 'rolls', quantity: 0, minQuantity: 3, unitPrice: 45, description: 'Reflective roof insulation 10mm 30m²/roll' },
  { name: 'Waterproof Membrane Roll', category: 'Insulation', unit: 'rolls', quantity: 0, minQuantity: 2, unitPrice: 120, description: 'Bituminous waterproof membrane 4mm x 10m' },
  // Hardware & Fasteners
  { name: 'Drywall Screw 25mm', category: 'Hardware & Fasteners', unit: 'boxes', quantity: 0, minQuantity: 5, unitPrice: 8, description: 'Self-tapping drywall screw 25mm 1000pcs/box' },
  { name: 'Drywall Screw 40mm', category: 'Hardware & Fasteners', unit: 'boxes', quantity: 0, minQuantity: 5, unitPrice: 10, description: 'Self-tapping drywall screw 40mm 1000pcs/box' },
  { name: 'Concrete Nail 2"', category: 'Hardware & Fasteners', unit: 'kg', quantity: 0, minQuantity: 5, unitPrice: 3, description: 'Hardened concrete nail 2 inch' },
  { name: 'Wood Screw 1.5"', category: 'Hardware & Fasteners', unit: 'boxes', quantity: 0, minQuantity: 3, unitPrice: 6, description: 'Phillips wood screw 1.5 inch 200pcs/box' },
  { name: 'Anchor Bolt M10', category: 'Hardware & Fasteners', unit: 'pieces', quantity: 0, minQuantity: 20, unitPrice: 1.5, description: 'Expansion anchor bolt M10 x 80mm' },
  { name: 'Anchor Bolt M12', category: 'Hardware & Fasteners', unit: 'pieces', quantity: 0, minQuantity: 20, unitPrice: 2.5, description: 'Expansion anchor bolt M12 x 100mm' },
  { name: 'Epoxy Adhesive 500ml', category: 'Hardware & Fasteners', unit: 'pieces', quantity: 0, minQuantity: 5, unitPrice: 15, description: 'Two-part epoxy adhesive 500ml' },
  // Plumbing Fixtures
  { name: 'Bathtub Standard', category: 'Plumbing Fixtures', unit: 'set', quantity: 0, minQuantity: 0, unitPrice: 350, description: 'Acrylic bathtub standard 1700mm' },
  { name: 'Bathroom Vanity 60cm', category: 'Plumbing Fixtures', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 180, description: 'Wall-mount bathroom vanity 60cm' },
  { name: 'Urinal Wall-Mount', category: 'Plumbing Fixtures', unit: 'set', quantity: 0, minQuantity: 1, unitPrice: 85, description: 'Wall-mount urinal with flush valve' },
]

// Seed data helpers
export const seedDataDb = {
  hasSeeded: (): boolean => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('cp_seeded') === 'true'
  },
  seedAll: (): number => {
    let count = 0
    const allItems = [
      ...mepElectricalItems,
      ...mepPlumbingItems,
      ...mepHVACItems,
      ...mepELVItems,
      ...buildingMaterialItems
    ]
    const existing = inventoryDb.getAll()
    const existingNames = new Set(existing.map(i => i.name))
    for (const item of allItems) {
      if (!existingNames.has(item.name)) {
        inventoryDb.create(item as any)
        count++
      }
    }
    localStorage.setItem('cp_seeded', 'true')
    return count
  },
  seedByCategory: (category: InventoryCategory): number => {
    let count = 0
    const categoryItems = allSeedItems.filter(i => i.category === category)
    const existing = inventoryDb.getAll()
    const existingNames = new Set(existing.map(i => i.name))
    for (const item of categoryItems) {
      if (!existingNames.has(item.name)) {
        inventoryDb.create(item as any)
        count++
      }
    }
    return count
  },
  getAllSeedItems: () => allSeedItems
}

const allSeedItems = [
  ...mepElectricalItems,
  ...mepPlumbingItems,
  ...mepHVACItems,
  ...mepELVItems,
  ...buildingMaterialItems
]

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
    return teamDb.create({
      userId: invitedBy,
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
