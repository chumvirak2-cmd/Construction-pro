import { NextRequest, NextResponse } from 'next/server'
import { query, getMySQLConnection } from '@/lib/mysql'
import bcrypt from 'bcryptjs'
import {
  createUserInStore,
  deleteUserInStore,
  getUserByEmailFromStore,
  getUserByIdFromStore,
  getUsersFromStore,
  updateUserInStore
} from '@/app/lib/server-store'

export const runtime = 'nodejs'

interface MySQLUser {
  id: string
  email: string
  full_name: string
  company_name: string
  phone?: string
  role: string
  user_type: string
  management_level: string
  company_id?: string
  department?: string
  permissions: string
  created_at: string
  logo_url?: string
  subscription_id?: string
  password_hash: string
}

const SENSITIVE_FIELDS = ['password_hash'] as const

function sanitizeUser(user: MySQLUser) {
  const { password_hash, ...rest } = user
  return {
    ...rest,
    permissions: user.permissions ? JSON.parse(user.permissions) : [],
    department: user.department || undefined
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const email = searchParams.get('email')
    const id = searchParams.get('id')

    if (id) {
      try {
        const users = await query<MySQLUser>('SELECT * FROM users WHERE id = ?', [id])
        if (users.length > 0) {
          return NextResponse.json(sanitizeUser(users[0]))
        }
      } catch {
        const fallbackUser = await getUserByIdFromStore(id)
        if (fallbackUser) {
          return NextResponse.json(sanitizeUser(fallbackUser as MySQLUser))
        }
      }

      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (email) {
      try {
        const users = await query<MySQLUser>('SELECT * FROM users WHERE email = ?', [email])
        if (users.length > 0) {
          return NextResponse.json(sanitizeUser(users[0]))
        }
      } catch {
        const fallbackUser = await getUserByEmailFromStore(email)
        if (fallbackUser) {
          return NextResponse.json(sanitizeUser(fallbackUser as MySQLUser))
        }
      }

      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let sql = 'SELECT * FROM users'
    const params: any[] = []

    if (companyId) {
      sql += ' WHERE company_id = ?'
      params.push(companyId)
    }

    sql += ' ORDER BY created_at DESC'

    try {
      const users = await query<MySQLUser>(sql, params)
      return NextResponse.json(users.map(sanitizeUser))
    } catch {
      const users = await getUsersFromStore()
      return NextResponse.json(users.map(sanitizeUser))
    }
  } catch (error) {
    console.error('GET /api/users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let connection: Awaited<ReturnType<typeof getMySQLConnection>> | null = null

  try {
    connection = await getMySQLConnection().catch(() => null)
    const body = await request.json()
    const {
      email,
      password,
      fullName,
      companyName,
      phone,
      role = 'user',
      userType = 'worker',
      managementLevel = 'worker',
      companyId,
      department,
      permissions = []
    } = body

    if (!email || !fullName || !companyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    try {
      const existing = await query<MySQLUser>('SELECT id FROM users WHERE email = ?', [email])
      if (existing.length > 0) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 })
      }
    } catch {
      const existing = await getUserByEmailFromStore(email)
      if (existing) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 })
      }
    }

    const id = `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const passwordHash = await bcrypt.hash(password || 'changeme', 10)

    try {
      if (!connection) {
        throw new Error('mysql-unavailable')
      }

      await connection.execute(
        `INSERT INTO users (id, email, password_hash, full_name, company_name, phone, role, user_type, management_level, company_id, department, permissions, created_at, logo_url, subscription_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          email,
          passwordHash,
          fullName,
          companyName,
          phone || null,
          role,
          userType,
          managementLevel,
          companyId || null,
          department || null,
          JSON.stringify(permissions),
          createdAt,
          null,
          null
        ]
      )

      const [users] = await connection.execute<any>('SELECT * FROM users WHERE id = ?', [id])
      return NextResponse.json(sanitizeUser(users[0] as MySQLUser), { status: 201 })
    } catch {
      const storedUser = await createUserInStore({
        id,
        email,
        password_hash: passwordHash,
        full_name: fullName,
        company_name: companyName,
        phone: phone || null,
        role,
        user_type: userType,
        management_level: managementLevel,
        company_id: companyId || null,
        department: department || null,
        permissions: JSON.stringify(permissions),
        created_at: createdAt,
        logo_url: null,
        subscription_id: null
      })
      return NextResponse.json(sanitizeUser(storedUser as MySQLUser), { status: 201 })
    }
  } catch (error) {
    console.error('POST /api/users error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
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
      const existing = await query<MySQLUser>('SELECT id FROM users WHERE id = ?', [id])
      if (existing.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    } catch {
      const existing = await getUserByIdFromStore(id)
      if (!existing) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    }

    const allowed = ['email', 'full_name', 'company_name', 'phone', 'role', 'user_type', 'management_level', 'company_id', 'department', 'logo_url', 'subscription_id']
    const setClause: string[] = []
    const params: any[] = []

    for (const key of allowed) {
      if (key in updates) {
        setClause.push(`${key} = ?`)
        params.push(updates[key] ?? null)
      }
    }

    if ('permissions' in updates) {
      setClause.push('permissions = ?')
      params.push(JSON.stringify(updates.permissions || []))
    }

    if ('password' in updates && updates.password) {
      const passwordHash = await bcrypt.hash(updates.password, 10)
      setClause.push('password_hash = ?')
      params.push(passwordHash)
    }

    if (setClause.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    params.push(id)
    try {
      await connection.execute(`UPDATE users SET ${setClause.join(', ')} WHERE id = ?`, params)

      const [users] = await connection.execute<any>('SELECT * FROM users WHERE id = ?', [id])
      return NextResponse.json(sanitizeUser(users[0] as MySQLUser))
    } catch {
      const updatedUser = await updateUserInStore(id, {
        ...updates,
        ...(updates.password ? { password_hash: await bcrypt.hash(updates.password, 10) } : {}),
        ...(updates.full_name ? { full_name: updates.full_name } : {}),
        ...(updates.company_name ? { company_name: updates.company_name } : {}),
        ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
        ...(updates.role ? { role: updates.role } : {}),
        ...(updates.user_type ? { user_type: updates.user_type } : {}),
        ...(updates.management_level ? { management_level: updates.management_level } : {}),
        ...(updates.company_id !== undefined ? { company_id: updates.company_id } : {}),
        ...(updates.department !== undefined ? { department: updates.department } : {}),
        ...(updates.permissions ? { permissions: JSON.stringify(updates.permissions) } : {}),
        ...(updates.logo_url !== undefined ? { logo_url: updates.logo_url } : {}),
        ...(updates.subscription_id !== undefined ? { subscription_id: updates.subscription_id } : {})
      })

      if (!updatedUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json(sanitizeUser(updatedUser as MySQLUser))
    }
  } catch (error) {
    console.error('PUT /api/users error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
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
      const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]) as any
      if (result.affectedRows === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json({ deleted: id })
    } catch {
      const deleted = await deleteUserInStore(id)
      if (!deleted) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json({ deleted: id })
    }
  } catch (error) {
    console.error('DELETE /api/users error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  } finally {
    connection.release()
  }
}
