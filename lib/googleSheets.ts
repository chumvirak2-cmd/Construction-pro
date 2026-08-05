import { google } from 'googleapis'

export type SheetRow = Record<string, any>

export const SHEET_TABS = {
  PROJECTS: 'Projects',
  WORKERS: 'Workers',
  INVENTORY: 'Inventory',
  BOQS: 'BOQs',
  CLIENTS: 'Clients',
  ATTENDANCE: 'Attendance',
  PAYROLL: 'Payroll',
  PURCHASE_ORDERS: 'PurchaseOrders',
  USERS: 'Users',
  COMPANIES: 'Companies',
  SUBSCRIPTIONS: 'Subscriptions',
  TEAM_MEMBERS: 'TeamMembers',
  WORKER_LOCATIONS: 'WorkerLocations',
  TRACKING_ALERTS: 'TrackingAlerts',
  MANAGER_NOTIFICATIONS: 'ManagerNotifications',
  SITE_CONFIG: 'SiteConfig',
  SETTINGS: 'Settings'
} as const

export type SheetCollection = keyof typeof SHEET_TABS
export type SheetTab = typeof SHEET_TABS[SheetCollection]

const DEFAULT_HEADERS: Record<SheetCollection, string[]> = {
  PROJECTS: ['id', 'name', 'description', 'client', 'location', 'buildingType', 'startDate', 'endDate', 'status', 'systems', 'itSystems', 'budget', 'actualCost', 'manager', 'createdAt', 'updatedAt'],
  WORKERS: ['id', 'name', 'role', 'skills', 'phone', 'email', 'dateOfBirth', 'address', 'photo', 'hourlyRate', 'dailyRate', 'overtimeRate', 'joinDate', 'status', 'createdAt'],
  INVENTORY: ['id', 'name', 'category', 'subCategory', 'description', 'quantity', 'unit', 'minQuantity', 'unitPrice', 'supplier', 'location', 'lastRestocked', 'createdAt'],
  BOQS: ['id', 'projectId', 'name', 'items', 'subtotal', 'taxRate', 'taxAmount', 'grandTotal', 'createdAt', 'updatedAt', 'status'],
  CLIENTS: ['id', 'name', 'email', 'phone', 'address', 'company', 'contactPerson', 'status', 'notes', 'createdAt', 'updatedAt'],
  ATTENDANCE: ['id', 'workerId', 'date', 'checkIn', 'checkOut', 'location', 'status', 'notes'],
  PAYROLL: ['id', 'workerId', 'month', 'year', 'regularHours', 'overtimeHours', 'deductions', 'bonuses', 'netPay', 'status'],
  PURCHASE_ORDERS: ['id', 'items', 'supplier', 'totalAmount', 'status', 'orderDate', 'expectedDelivery', 'notes'],
  USERS: ['id', 'email', 'fullName', 'companyName', 'phone', 'role', 'userType', 'managementLevel', 'companyId', 'department', 'permissions', 'createdAt', 'logoUrl', 'subscriptionId'],
  COMPANIES: ['id', 'name', 'email', 'phone', 'address', 'logoUrl', 'subscriptionId', 'createdAt'],
  SUBSCRIPTIONS: ['id', 'userId', 'tier', 'status', 'currentPeriodStart', 'currentPeriodEnd', 'cancelAtPeriodEnd', 'stripeCustomerId', 'stripeSubscriptionId', 'abaTransactionId'],
  TEAM_MEMBERS: ['id', 'userId', 'companyId', 'email', 'fullName', 'phone', 'role', 'status', 'permissions', 'createdAt', 'invitedBy', 'lastLocation', 'isTrackingEnabled'],
  WORKER_LOCATIONS: ['id', 'phone', 'workerId', 'latitude', 'longitude', 'accuracy', 'timestamp', 'distanceFromSite', 'isOutsideSite'],
  TRACKING_ALERTS: ['id', 'workerId', 'phone', 'workerName', 'latitude', 'longitude', 'distanceFromSite', 'timestamp', 'status', 'resolvedAt'],
  MANAGER_NOTIFICATIONS: ['id', 'type', 'title', 'message', 'workerId', 'workerName', 'timestamp', 'read', 'actionUrl'],
  SITE_CONFIG: ['id', 'name', 'latitude', 'longitude', 'radiusMeters', 'isActive'],
  SETTINGS: ['id', 'currency', 'timezone', 'language', 'emailNotifications', 'pushNotifications', 'dailySummary', 'weeklyReport', 'theme', 'defaultProjectView', 'autoSave', 'compactMode']
}

type SheetsService = {
  sheets: any
  spreadsheetId: string
}

export async function getSheetsService(): Promise<SheetsService> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  if (!spreadsheetId) throw new Error('Missing GOOGLE_SHEETS_SPREADSHEET_ID')

  const auth = new google.auth.GoogleAuth({
    credentials: parseGoogleCredentials(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })
  const authClient = await auth.getClient()

  return {
    sheets: google.sheets({ version: 'v4', auth: authClient as any }),
    spreadsheetId
  }
}

export function resolveCollection(collection: string) {
  const normalized = normalize(collection)
  const match = Object.entries(SHEET_TABS).find(([key, tab]) => normalize(key) === normalized || normalize(tab) === normalized)

  if (!match) {
    throw new Error(`Unsupported Google Sheets collection: ${collection}`)
  }

  return { collection: match[0] as SheetCollection, tab: match[1] as SheetTab }
}

export async function ensureSheetHeaders(service: SheetsService, collectionOrTab: string) {
  const resolved = resolveCollection(collectionOrTab)
  await ensureSheetExists(service, resolved.tab)

  const headers = await getHeaders(service, resolved.tab)
  const requiredHeaders = DEFAULT_HEADERS[resolved.collection]
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header))

  if (missingHeaders.length > 0) {
    await service.sheets.spreadsheets.values.update({
      spreadsheetId: service.spreadsheetId,
      range: `${resolved.tab}!1:${headers.length + missingHeaders.length}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[...headers, ...missingHeaders]] }
    })
    return [...headers, ...missingHeaders]
  }

  return headers
}

export async function getHeaders(service: SheetsService, tab: SheetTab): Promise<string[]> {
  const res = await service.sheets.spreadsheets.values.get({
    spreadsheetId: service.spreadsheetId,
    range: `${tab}!1:1`
  })

  return ((res.data.values?.[0] || []) as string[]).map(String)
}

export async function readAll(service: SheetsService, tab: SheetTab): Promise<SheetRow[]> {
  const res = await service.sheets.spreadsheets.values.get({
    spreadsheetId: service.spreadsheetId,
    range: tab
  })
  const rows = res.data.values || []

  if (rows.length < 2) return []

  const headers = rows[0] as string[]

  return rows.slice(1).map((row: any[]) => {
    const obj: SheetRow = {}
    headers.forEach((h, i) => {
      obj[String(h)] = parseCell(row[i])
    })
    return obj
  })
}

export async function appendRow(service: SheetsService, tab: SheetTab, row: SheetRow): Promise<string> {
  const headers = await getHeaders(service, tab)
  const values = headers.map(h => serializeCell(row[h]))

  await service.sheets.spreadsheets.values.append({
    spreadsheetId: service.spreadsheetId,
    range: tab,
    valueInputOption: 'RAW',
    requestBody: { values: [values] }
  })

  return String(row.id)
}

export async function updateRow(service: SheetsService, tab: SheetTab, id: string, data: SheetRow): Promise<boolean> {
  const headers = await getHeaders(service, tab)
  const rows = await readAll(service, tab)
  const idx = rows.findIndex(row => String(row.id) === String(id))

  if (idx === -1) return false

  const updated: SheetRow = { ...rows[idx], ...data, id: rows[idx].id }
  const values = headers.map(h => serializeCell(updated[h]))
  const rowNumber = idx + 2

  await service.sheets.spreadsheets.values.update({
    spreadsheetId: service.spreadsheetId,
    range: `${tab}!${rowNumber}:${rowNumber}`,
    valueInputOption: 'RAW',
    requestBody: { values: [values] }
  })

  return true
}

export async function deleteRow(service: SheetsService, tab: SheetTab, id: string): Promise<boolean> {
  const headers = await getHeaders(service, tab)
  const rows = await readAll(service, tab)
  const remaining = rows.filter(row => String(row.id) !== String(id))

  if (remaining.length === rows.length) return false

  await service.sheets.spreadsheets.values.clear({
    spreadsheetId: service.spreadsheetId,
    range: tab
  })

  if (remaining.length > 0) {
    await service.sheets.spreadsheets.values.update({
      spreadsheetId: service.spreadsheetId,
      range: `${tab}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers, ...remaining.map(row => headers.map(h => serializeCell(row[h])))] }
    })
  }

  return true
}

export async function replaceSheet(service: SheetsService, collection: string, rows: SheetRow[]): Promise<void> {
  const { tab } = resolveCollection(collection)
  const headers = await ensureSheetHeaders(service, tab)

  await service.sheets.spreadsheets.values.clear({
    spreadsheetId: service.spreadsheetId,
    range: tab
  })

  if (rows.length === 0) return

  await service.sheets.spreadsheets.values.update({
    spreadsheetId: service.spreadsheetId,
    range: `${tab}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [headers, ...rows.map(row => headers.map(h => serializeCell(row[h])))] }
  })
}

export function generateId(): string {
  const cryptoApi = globalThis.crypto
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function parseGoogleCredentials(): any {
  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS
  if (!credentials) throw new Error('Missing GOOGLE_SHEETS_CREDENTIALS')

  try {
    return JSON.parse(credentials)
  } catch {
    throw new Error('Invalid GOOGLE_SHEETS_CREDENTIALS JSON')
  }
}

async function ensureSheetExists(service: SheetsService, tab: SheetTab) {
  const spreadsheet = await service.sheets.spreadsheets.get({ spreadsheetId: service.spreadsheetId })
  const exists = spreadsheet.data.sheets?.some((sheet: any) => sheet.properties?.title === tab)

  if (!exists) {
    await service.sheets.spreadsheets.batchUpdate({
      spreadsheetId: service.spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: tab } } }]
      }
    })
  }
}

function serializeCell(value: any): string | number | boolean | null {
  if (value === undefined) return ''
  if (value === null) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return value
}

function parseCell(value: any): any {
  if (typeof value !== 'string') return value

  const trimmed = value.trim()
  if (!trimmed) return ''

  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return value
    }
  }

  return value
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}
