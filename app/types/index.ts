// User and Authentication Types
export type ManagementLevel = 'super_admin' | 'company_admin' | 'manager' | 'supervisor' | 'worker' | 'viewer'

export interface User {
  id: string
  email: string
  fullName: string
  companyName: string
  phone?: string
  role: 'admin' | 'manager' | 'user'
  userType: 'company_admin' | 'worker'
  managementLevel: ManagementLevel
  companyId?: string
  department?: 'marketing' | 'sales' | 'operations' | 'mep' | 'finance' | 'hr'
  permissions: string[]
  createdAt: string
  logoUrl?: string
  subscriptionId?: string
}

export interface Company {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  logoUrl?: string
  subscriptionId?: string
  createdAt: string
}

export interface TeamMember {
  id: string
  userId: string
  companyId: string
  email: string
  fullName: string
  phone?: string
  role: 'manager' | 'worker' | 'viewer' | 'marketing' | 'sell'
  status: 'active' | 'inactive'
  permissions: string[]
  createdAt: string
  invitedBy?: string
  lastLocation?: {
    lat: number
    lng: number
    timestamp: string
    accuracy: number
  }
  isTrackingEnabled: boolean
}

// Project Types
export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'

export type BuildingType =
  | 'Villa'
  | 'Townhouse'
  | 'Shophouse'
  | 'Apartment'
  | 'Condominium'
  | 'Office Building'
  | 'Shopping Mall'
  | 'Warehouse'
  | 'Factory'
  | 'Hospital'
  | 'School'
  | 'Hotel'
  | 'Resort'
  | 'Mixed-Use'
  | 'Other'

export type MEPSystem =
  | 'HVAC'
  | 'Electrical'
  | 'Plumbing'
  | 'ELV'
  | 'Fire Protection'
  | 'Gas System'
  | 'Solar/Energy'
  | 'BMS/Controls'
  | 'Lift & Escalator'

export type MEPSubCategory =
  // Mechanical (HVAC)
  | 'Split Unit AC'
  | 'Central AC'
  | 'VRF System'
  | 'Chiller'
  | 'AHU'
  | 'FCU'
  | 'Exhaust Fan'
  | 'Ventilation Duct'
  | 'Insulation'
  // Electrical
  | 'Main Switch Board'
  | 'Distribution Board'
  | 'Transformer'
  | 'Generator'
  | 'Cable/Wiring'
  | 'Lighting'
  | 'Switches & Sockets'
  | 'UPS'
  | 'Circuit Breaker'
  | 'Conduit & Trunking'
  // Plumbing
  | 'Water Tank'
  | 'Water Pump'
  | 'Piping (PPR/PVC)'
  | 'Valve'
  | 'Sanitary Fixture'
  | 'Hot Water System'
  | 'Drainage System'
  // Fire Protection
  | 'Fire Extinguisher'
  | 'Fire Sprinkler'
  | 'Fire Alarm System'
  | 'Fire Hydrant'
  | 'Smoke Detector'
  // ELV
  | 'CCTV'
  | 'Access Control'
  | 'PA System'
  | 'Data Network'
  | 'Telephone System'
  | 'TV Antenna'
  // Gas
  | 'LPG Piping'
  | 'Natural Gas Piping'
  | 'Gas Detector'

export interface Project {
  id: string
  name: string
  description: string
  client: string
  location: string
  buildingType: BuildingType
  startDate: string
  endDate?: string
  status: ProjectStatus
  systems: MEPSystem[]
  itSystems?: string[]
  budget: number
  actualCost: number
  manager: string
  createdAt: string
  updatedAt: string
}

export interface ProjectTask {
  id: string
  projectId: string
  title: string
  description: string
  assignedTo: string[]
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
}

// Worker Types
export type WorkerRole = 
  // Construction & MEP Trades
  | 'Electrician' 
  | 'Plumber' 
  | 'HVAC Technician' 
  | 'Welder'
  | 'Carpenter'
  | 'Mason'
  | 'Painter'
  | 'Roofer'
  | 'Iron Worker'
  | 'Pipe Fitter'
  | 'Scaffolder'
  | 'Crane Operator'
  | 'Heavy Equipment Operator'
  | 'Tile Setter'
  | 'Glazier'
  | 'Drywall Installer'
  | 'Flooring Installer'
  // Engineering & Technical
  | 'Site Engineer'
  | 'Structural Engineer'
  | 'Civil Engineer'
  | 'MEP Engineer'
  | 'Quality Control Engineer'
  | 'Safety Engineer'
  | 'IT Engineer'
  | 'Surveyor'
  | 'Geotechnical Engineer'
  | 'Estimation Engineer'
  // Project Management & Supervision
  | 'Project Manager'
  | 'Project Coordinator'
  | 'Construction Manager'
  | 'Site Supervisor'
  | 'Foreman'
  | 'General Foreman'
  | 'Supervisor'
  // Real Estate Development
  | 'Real Estate Developer'
  | 'Land Acquisition Manager'
  | 'Property Manager'
  | 'Leasing Agent'
  | 'Real Estate Agent'
  | 'Real Estate Broker'
  | 'Valuation Specialist'
  | 'Market Analyst'
  | 'Land Surveyor'
  // Design & Architecture
  | 'Architect'
  | 'Interior Designer'
  | 'Landscape Architect'
  | 'Drafter'
  | 'BIM Modeler'
  | '3D Visualizer'
  // Administrative & Support
  | 'Accountant'
  | 'Admin'
  | 'HR Manager'
  | 'Procurement Officer'
  | 'Stock Manager'
  | 'Warehouse Keeper'
  | 'Document Controller'
  | 'Secretary'
  | 'Receptionist'
  | 'Legal Advisor'
  | 'Contract Administrator'
  // Sales & Marketing
  | 'Sales Manager'
  | 'Marketing Manager'
  | 'Sales Agent'
  | 'Digital Marketing Specialist'
  // Operations & Maintenance
  | 'Facility Manager'
  | 'Maintenance Technician'
  | 'Building Inspector'
  | 'Security Guard'
  | 'Cleaner'
  | 'Landscaper'
  // General Labor
  | 'General Worker'
  | 'Laborer'
  | 'Helper'
  // IT & Technology
  | 'Web Developer'
  | 'Mobile App Developer'
  | 'Software Developer'
  | 'UI/UX Designer'
  | 'IT Support'
  | 'Database Administrator'
  | 'Network Engineer'

export interface Worker {
  id: string
  name: string
  role: WorkerRole
  skills: string[]
  phone: string
  email?: string
  dateOfBirth: string
  address?: string
  photo?: string
  hourlyRate: number
  dailyRate: number
  overtimeRate: number
  joinDate: string
  status: 'active' | 'inactive' | 'on_leave'
  createdAt: string
}

export interface AttendanceRecord {
  id: string
  workerId: string
  date: string
  checkIn?: string
  checkOut?: string
  location?: { lat: number; lng: number }
  status: 'present' | 'absent' | 'late' | 'overtime'
  notes?: string
}

export interface WorkerLocation {
  id: string
  phone: string
  workerId: string
  latitude: number
  longitude: number
  accuracy: number
  timestamp: string
  distanceFromSite: number
  isOutsideSite: boolean
}

export interface TrackingAlert {
  id: string
  workerId: string
  phone: string
  workerName: string
  latitude: number
  longitude: number
  distanceFromSite: number
  timestamp: string
  status: 'active' | 'resolved'
  resolvedAt?: string
}

export interface PayrollRecord {
  id: string
  workerId: string
  month: string
  year: number
  regularHours: number
  overtimeHours: number
  deductions: number
  bonuses: number
  netPay: number
  status: 'draft' | 'pending' | 'paid'
}

// Inventory Types
export type InventoryCategory =
  // MEP Categories
  | 'HVAC'
  | 'Electrical'
  | 'Plumbing'
  | 'ELV'
  | 'Fire Protection'
  | 'Gas System'
  | 'Solar/Energy'
  | 'BMS/Controls'
  | 'Lift & Escalator'
  // Building Material Categories
  | 'Concrete & Cement'
  | 'Steel & Metal'
  | 'Wood & Timber'
  | 'Roofing'
  | 'Doors & Windows'
  | 'Tiles & Flooring'
  | 'Paint & Coating'
  | 'Insulation'
  | 'Sand & Aggregate'
  | 'Bricks & Blocks'
  | 'Glass & Glazing'
  | 'Hardware & Fasteners'
  | 'Plumbing Fixtures'
  | 'Tools'
  | 'Safety'
  | 'Other'

export interface InventoryItem {
  id: string
  name: string
  category: InventoryCategory
  subCategory?: MEPSubCategory
  description?: string
  quantity: number
  unit: string
  minQuantity: number
  unitPrice: number
  supplier?: string
  location?: string
  lastRestocked?: string
  createdAt: string
}

export interface PurchaseOrder {
  id: string
  items: { itemId: string; quantity: number; unitPrice: number }[]
  supplier: string
  totalAmount: number
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled'
  orderDate: string
  expectedDelivery?: string
  notes?: string
}

// BOQ Types
export interface BOQItem {
  id: string
  description: string
  unit: string
  quantity: number
  unitRate: number
  totalRate: number
  category: string
}

export interface BOQ {
  id: string
  projectId: string
  name: string
  items: BOQItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  grandTotal: number
  createdAt: string
  updatedAt: string
  status: 'draft' | 'sent' | 'approved'
}

// Dashboard Analytics Types
export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalWorkers: number
  activeWorkers: number
  totalInventory: number
  lowStockItems: number
  totalRevenue: number
  monthlyExpenses: number
}

// Settings Types
export interface AppSettings {
  currency: string
  timezone: string
  language: string
  emailNotifications: boolean
  pushNotifications: boolean
  dailySummary: boolean
  weeklyReport: boolean
  theme: 'light' | 'dark' | 'system'
  defaultProjectView: 'grid' | 'list'
  autoSave: boolean
  compactMode: boolean
}

// Subscription Types
export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'unpaid' | 'none'

export interface SubscriptionPlan {
  id: SubscriptionTier
  name: string
  price: number
  yearlyPrice: number
  interval: 'month' | 'year'
  limits: {
    maxProjects: number
    maxWorkers: number
    maxInventoryItems: number
    maxStorageMB: number
    maxUsers: number
    features: string[]
  }
  stripePriceIdMonthly: string
  stripePriceIdYearly: string
}

export interface Subscription {
  id: string
  userId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

// Permission and Access Control Types
export const PERMISSIONS = {
  // User Management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  INVITE_USERS: 'invite_users',
  
  // Company Management
  MANAGE_COMPANY: 'manage_company',
  VIEW_COMPANY_SETTINGS: 'view_company_settings',
  
  // Projects
  CREATE_PROJECTS: 'create_projects',
  EDIT_PROJECTS: 'edit_projects',
  DELETE_PROJECTS: 'delete_projects',
  VIEW_PROJECTS: 'view_projects',
  
  // Workers
  CREATE_WORKERS: 'create_workers',
  EDIT_WORKERS: 'edit_workers',
  DELETE_WORKERS: 'delete_workers',
  VIEW_WORKERS: 'view_workers',
  TRACK_WORKERS: 'track_workers',
  
  // Inventory
  CREATE_INVENTORY: 'create_inventory',
  EDIT_INVENTORY: 'edit_inventory',
  DELETE_INVENTORY: 'delete_inventory',
  VIEW_INVENTORY: 'view_inventory',
  
  // BOQ
  CREATE_BOQ: 'create_boq',
  EDIT_BOQ: 'edit_boq',
  DELETE_BOQ: 'delete_boq',
  VIEW_BOQ: 'view_boq',
  
  // Financial
  VIEW_FINANCIAL: 'view_financial',
  MANAGE_SUBSCRIPTION: 'manage_subscription',
  
  // Marketing
  MANAGE_CAMPAIGNS: 'manage_campaigns',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_LEADS: 'manage_leads',
  
  // Sales
  MANAGE_CLIENTS: 'manage_clients',
  MANAGE_DEALS: 'manage_deals',
  CREATE_QUOTES: 'create_quotes',
  
  // MEP Systems
  VIEW_MEP_SYSTEMS: 'view_mep_systems',
  MANAGE_MEP_SYSTEMS: 'manage_mep_systems'
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

export const MANAGEMENT_LEVEL_PERMISSIONS: Record<ManagementLevel, Permission[]> = {
  super_admin: Object.values(PERMISSIONS),
  company_admin: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.INVITE_USERS,
    PERMISSIONS.MANAGE_COMPANY,
    PERMISSIONS.VIEW_COMPANY_SETTINGS,
    PERMISSIONS.CREATE_PROJECTS,
    PERMISSIONS.EDIT_PROJECTS,
    PERMISSIONS.DELETE_PROJECTS,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.CREATE_WORKERS,
    PERMISSIONS.EDIT_WORKERS,
    PERMISSIONS.DELETE_WORKERS,
    PERMISSIONS.VIEW_WORKERS,
    PERMISSIONS.TRACK_WORKERS,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.EDIT_INVENTORY,
    PERMISSIONS.DELETE_INVENTORY,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_BOQ,
    PERMISSIONS.EDIT_BOQ,
    PERMISSIONS.DELETE_BOQ,
    PERMISSIONS.VIEW_BOQ,
    PERMISSIONS.VIEW_FINANCIAL,
    PERMISSIONS.MANAGE_SUBSCRIPTION,
    PERMISSIONS.MANAGE_CAMPAIGNS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_LEADS,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.MANAGE_DEALS,
    PERMISSIONS.CREATE_QUOTES,
    PERMISSIONS.VIEW_MEP_SYSTEMS,
    PERMISSIONS.MANAGE_MEP_SYSTEMS
  ],
  manager: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.INVITE_USERS,
    PERMISSIONS.CREATE_PROJECTS,
    PERMISSIONS.EDIT_PROJECTS,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.CREATE_WORKERS,
    PERMISSIONS.EDIT_WORKERS,
    PERMISSIONS.VIEW_WORKERS,
    PERMISSIONS.TRACK_WORKERS,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.EDIT_INVENTORY,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_BOQ,
    PERMISSIONS.EDIT_BOQ,
    PERMISSIONS.VIEW_BOQ,
    PERMISSIONS.VIEW_FINANCIAL,
    PERMISSIONS.MANAGE_CAMPAIGNS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_LEADS,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.MANAGE_DEALS,
    PERMISSIONS.CREATE_QUOTES,
    PERMISSIONS.VIEW_MEP_SYSTEMS,
    PERMISSIONS.MANAGE_MEP_SYSTEMS
  ],
  supervisor: [
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_WORKERS,
    PERMISSIONS.TRACK_WORKERS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_BOQ,
    PERMISSIONS.VIEW_MEP_SYSTEMS
  ],
  worker: [
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_WORKERS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_BOQ,
    PERMISSIONS.VIEW_MEP_SYSTEMS
  ],
  viewer: [
    PERMISSIONS.VIEW_PROJECTS
  ]
}

export function hasPermission(user: User, permission: Permission): boolean {
  return user.permissions.includes(permission) || 
         MANAGEMENT_LEVEL_PERMISSIONS[user.managementLevel].includes(permission)
}

export function canAccessDepartment(user: User, department: string): boolean {
  if (user.managementLevel === 'super_admin' || user.managementLevel === 'company_admin') {
    return true
  }
  
  if (!user.department) {
    return false
  }
  
  return user.department === department
}

