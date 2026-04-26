import { User, Permission, MANAGEMENT_LEVEL_PERMISSIONS } from '../types'

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false
  
  // Super admin and company admin have all permissions
  if (user.managementLevel === 'super_admin' || user.managementLevel === 'company_admin') {
    return true
  }
  
  // Check if permission is in user's permissions array
  if (user.permissions.includes(permission)) {
    return true
  }
  
  // Check management level permissions
  return MANAGEMENT_LEVEL_PERMISSIONS[user.managementLevel].includes(permission)
}

export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false
  return permissions.some(permission => hasPermission(user, permission))
}

export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false
  return permissions.every(permission => hasPermission(user, permission))
}

export function canAccessDepartment(user: User | null, department: string): boolean {
  if (!user) return false
  
  // Super admin and company admin can access all departments
  if (user.managementLevel === 'super_admin' || user.managementLevel === 'company_admin') {
    return true
  }
  
  // Check if user's department matches
  return user.department === department
}

export function getAccessibleDepartments(user: User | null): string[] {
  if (!user) return []
  
  // Super admin and company admin can access all departments
  if (user.managementLevel === 'super_admin' || user.managementLevel === 'company_admin') {
    return ['marketing', 'sales', 'operations', 'mep', 'finance', 'hr']
  }
  
  // Other users can only access their assigned department
  return user.department ? [user.department] : []
}

// Permission checkers for specific features
export const FeaturePermissions = {
  canManageUsers: (user: User | null) => hasPermission(user, 'manage_users'),
  canViewFinancials: (user: User | null) => hasPermission(user, 'view_financial'),
  canManageSubscription: (user: User | null) => hasPermission(user, 'manage_subscription'),
  canCreateProjects: (user: User | null) => hasPermission(user, 'create_projects'),
  canEditProjects: (user: User | null) => hasPermission(user, 'edit_projects'),
  canDeleteProjects: (user: User | null) => hasPermission(user, 'delete_projects'),
  canManageWorkers: (user: User | null) => hasPermission(user, 'create_workers'),
  canTrackWorkers: (user: User | null) => hasPermission(user, 'track_workers'),
  canManageInventory: (user: User | null) => hasPermission(user, 'create_inventory'),
  canManageBOQ: (user: User | null) => hasPermission(user, 'create_boq'),
  canManageCampaigns: (user: User | null) => hasPermission(user, 'manage_campaigns'),
  canViewAnalytics: (user: User | null) => hasPermission(user, 'view_analytics'),
  canManageClients: (user: User | null) => hasPermission(user, 'manage_clients'),
  canManageDeals: (user: User | null) => hasPermission(user, 'manage_deals'),
  canCreateQuotes: (user: User | null) => hasPermission(user, 'create_quotes'),
  canManageMEPSystems: (user: User | null) => hasPermission(user, 'manage_mep_systems')
}
