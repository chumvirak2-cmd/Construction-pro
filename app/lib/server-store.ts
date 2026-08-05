import fs from 'fs/promises'
import path from 'path'

type StoreData = {
  users: any[]
  companies: any[]
  subscriptions: any[]
}

const STORE_FILE = path.join(process.cwd(), 'data', 'app-store.json')

async function readStore(): Promise<StoreData> {
  try {
    await fs.mkdir(path.dirname(STORE_FILE), { recursive: true })
    const raw = await fs.readFile(STORE_FILE, 'utf8')
    const parsed = JSON.parse(raw)

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      companies: Array.isArray(parsed.companies) ? parsed.companies : [],
      subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : []
    }
  } catch {
    const initial: StoreData = { users: [], companies: [], subscriptions: [] }
    await writeStore(initial)
    return initial
  }
}

async function writeStore(store: StoreData): Promise<void> {
  await fs.mkdir(path.dirname(STORE_FILE), { recursive: true })
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), 'utf8')
}

export async function getUsersFromStore(): Promise<any[]> {
  const store = await readStore()
  return store.users
}

export async function getUserByEmailFromStore(email: string): Promise<any | null> {
  const store = await readStore()
  const normalized = email.trim().toLowerCase()
  return store.users.find((user) => user.email?.toLowerCase() === normalized) || null
}

export async function getUserByIdFromStore(id: string): Promise<any | null> {
  const store = await readStore()
  return store.users.find((user) => user.id === id) || null
}

export async function createUserInStore(user: any): Promise<any> {
  const store = await readStore()
  const existing = store.users.find((candidate) => candidate.email?.toLowerCase() === user.email?.toLowerCase())
  if (existing) {
    return existing
  }

  store.users.push(user)
  await writeStore(store)
  return user
}

export async function updateUserInStore(id: string, updates: Record<string, any>): Promise<any | null> {
  const store = await readStore()
  const index = store.users.findIndex((candidate) => candidate.id === id)
  if (index === -1) {
    return null
  }

  store.users[index] = { ...store.users[index], ...updates }
  await writeStore(store)
  return store.users[index]
}

export async function deleteUserInStore(id: string): Promise<boolean> {
  const store = await readStore()
  const nextUsers = store.users.filter((candidate) => candidate.id !== id)
  if (nextUsers.length === store.users.length) {
    return false
  }

  store.users = nextUsers
  await writeStore(store)
  return true
}

export async function getCompaniesFromStore(): Promise<any[]> {
  const store = await readStore()
  return store.companies
}

export async function getCompanyByEmailFromStore(email: string): Promise<any | null> {
  const store = await readStore()
  const normalized = email.trim().toLowerCase()
  return store.companies.find((company) => company.email?.toLowerCase() === normalized) || null
}

export async function getCompanyByIdFromStore(id: string): Promise<any | null> {
  const store = await readStore()
  return store.companies.find((company) => company.id === id) || null
}

export async function createCompanyInStore(company: any): Promise<any> {
  const store = await readStore()
  const existing = store.companies.find((candidate) => candidate.email?.toLowerCase() === company.email?.toLowerCase())
  if (existing) {
    return existing
  }

  store.companies.push(company)
  await writeStore(store)
  return company
}

export async function updateCompanyInStore(id: string, updates: Record<string, any>): Promise<any | null> {
  const store = await readStore()
  const index = store.companies.findIndex((candidate) => candidate.id === id)
  if (index === -1) {
    return null
  }

  store.companies[index] = { ...store.companies[index], ...updates }
  await writeStore(store)
  return store.companies[index]
}

export async function deleteCompanyInStore(id: string): Promise<boolean> {
  const store = await readStore()
  const nextCompanies = store.companies.filter((candidate) => candidate.id !== id)
  if (nextCompanies.length === store.companies.length) {
    return false
  }

  store.companies = nextCompanies
  await writeStore(store)
  return true
}
