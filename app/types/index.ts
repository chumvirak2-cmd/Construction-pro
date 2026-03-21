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
}

// Project Types
export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
export type MEPSystem = 'HVAC' | 'Electrical' | 'Plumbing' | 'ELV'

export interface Project {
  id: string
  name: string
  description: string
  client: string
  location: string
  startDate: string
  endDate?: string
  status: ProjectStatus
  systems: MEPSystem[]
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
  | 'Electrician' 
  | 'Plumber' 
  | 'HVAC Technician' 
  | 'IT Engineer' 
  | 'Site Engineer' 
  | 'Accountant' 
  | 'Admin' 
  | 'Stock Manager' 
  | 'Foreman' 
  | 'General Worker'

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
export type InventoryCategory = 'HVAC' | 'Electrical' | 'Plumbing' | 'ELV' | 'Tools' | 'Safety' | 'Other'

export interface InventoryItem {
  id: string
  name: string
  category: InventoryCategory
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
