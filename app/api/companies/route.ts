import { NextRequest, NextResponse } from 'next/server'
import { query, getMySQLConnection } from '@/lib/mysql'
import {
  createCompanyInStore,
  deleteCompanyInStore,
  getCompaniesFromStore,
  getCompanyByEmailFromStore,
  getCompanyByIdFromStore,
  updateCompanyInStore
} from '@/app/lib/server-store'

export const runtime = 'nodejs'

interface MySQLCompany {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  logo_url?: string
  subscription_id?: string
  created_at: string
}

const SENSITIVE_FIELDS = ['logo_url', 'subscription_id'] as const

function sanitizeCompany(company: MySQLCompany) {
  const { ...rest } = company
  return rest
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const email = searchParams.get('email')

    if (id) {
      try {
        const companies = await query<MySQLCompany>('SELECT * FROM companies WHERE id = ?', [id])
        if (companies.length > 0) {
          return NextResponse.json(sanitizeCompany(companies[0]))
        }
      } catch {
        const fallbackCompany = await getCompanyByIdFromStore(id)
        if (fallbackCompany) {
          return NextResponse.json(sanitizeCompany(fallbackCompany as MySQLCompany))
        }
      }

      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    if (email) {
      try {
        const companies = await query<MySQLCompany>('SELECT * FROM companies WHERE email = ?', [email])
        if (companies.length > 0) {
          return NextResponse.json(sanitizeCompany(companies[0]))
        }
      } catch {
        const fallbackCompany = await getCompanyByEmailFromStore(email)
        if (fallbackCompany) {
          return NextResponse.json(sanitizeCompany(fallbackCompany as MySQLCompany))
        }
      }

      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    try {
      const companies = await query<MySQLCompany>('SELECT * FROM companies ORDER BY created_at DESC')
      return NextResponse.json(companies.map(sanitizeCompany))
    } catch {
      const companies = await getCompaniesFromStore()
      return NextResponse.json(companies.map(sanitizeCompany))
    }
  } catch (error) {
    console.error('GET /api/companies error:', error)
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let connection: Awaited<ReturnType<typeof getMySQLConnection>> | null = null

  try {
    connection = await getMySQLConnection().catch(() => null)
    const body = await request.json()
    const {
      name,
      email,
      phone,
      address
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    const id = `company_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')

    try {
      if (!connection) {
        throw new Error('mysql-unavailable')
      }

      await connection.execute(
        `INSERT INTO companies (id, name, email, phone, address, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          name,
          email || null,
          phone || null,
          address || null,
          createdAt
        ]
      )

      const [companies] = await connection.execute<any>('SELECT * FROM companies WHERE id = ?', [id])
      return NextResponse.json(sanitizeCompany(companies[0] as MySQLCompany), { status: 201 })
    } catch {
      const storedCompany = await createCompanyInStore({
        id,
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        created_at: createdAt
      })
      return NextResponse.json(sanitizeCompany(storedCompany as MySQLCompany), { status: 201 })
    }
  } catch (error) {
    console.error('POST /api/companies error:', error)
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

export async function PUT(request: NextRequest) {
  const connection = await getMySQLConnection()
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    try {
      const existing = await query<MySQLCompany>('SELECT id FROM companies WHERE id = ?', [id])
      if (existing.length === 0) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 })
      }
    } catch {
      const existing = await getCompanyByIdFromStore(id)
      if (!existing) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 })
      }
    }

    const allowed = ['name', 'email', 'phone', 'address', 'logo_url', 'subscription_id']
    const setClause: string[] = []
    const params: any[] = []

    for (const key of allowed) {
      if (key in updates) {
        setClause.push(`${key} = ?`)
        params.push(updates[key] ?? null)
      }
    }

    if (setClause.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    params.push(id)
    try {
      await connection.execute(`UPDATE companies SET ${setClause.join(', ')} WHERE id = ?`, params)

      const [companies] = await connection.execute<any>('SELECT * FROM companies WHERE id = ?', [id])
      return NextResponse.json(sanitizeCompany(companies[0] as MySQLCompany))
    } catch {
      const updatedCompany = await updateCompanyInStore(id, {
        ...updates,
        ...(updates.name ? { name: updates.name } : {}),
        ...(updates.email ? { email: updates.email } : {}),
        ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
        ...(updates.address !== undefined ? { address: updates.address } : {}),
        ...(updates.logo_url !== undefined ? { logo_url: updates.logo_url } : {}),
        ...(updates.subscription_id !== undefined ? { subscription_id: updates.subscription_id } : {})
      })

      if (!updatedCompany) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 })
      }

      return NextResponse.json(sanitizeCompany(updatedCompany as MySQLCompany))
    }
  } catch (error) {
    console.error('PUT /api/companies error:', error)
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
  } finally {
    connection.release()
  }
}

export async function DELETE(request: NextRequest) {
  const connection = await getMySQLConnection()
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    try {
      const [result] = await connection.execute('DELETE FROM companies WHERE id = ?', [id]) as any
      if (result.affectedRows === 0) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 })
      }

      return NextResponse.json({ deleted: id })
    } catch {
      const deleted = await deleteCompanyInStore(id)
      if (!deleted) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 })
      }

      return NextResponse.json({ deleted: id })
    }
  } catch (error) {
    console.error('DELETE /api/companies error:', error)
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 })
  } finally {
    connection.release()
  }
}