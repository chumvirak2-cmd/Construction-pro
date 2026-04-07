// User and Authentication Types
export interface User {
  id: string
  email: string
  fullName: string
  companyName: string
  phone?: string
  role: 'admin' | 'manager' | 'user'
  createdAt: string
  logoUrl?: string
  subscriptionId?: string
}

export interface TeamMember {
  id: string
  userId: string
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
