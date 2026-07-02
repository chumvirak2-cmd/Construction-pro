import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

interface UserRow {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const { getMySQLPool } = await import('@/lib/mysql')
    const pool = getMySQLPool()
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.execute<any>('SELECT * FROM users WHERE email = ?', [email])
      const users = rows as UserRow[]
      const user = users[0]

      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const passwordHash = (user as any).password_hash as string | undefined
      if (!passwordHash) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const valid = await bcrypt.compare(password, passwordHash)
      if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const { password_hash, ...safeUser } = user
      return NextResponse.json({
        user: {
          ...safeUser,
          permissions: user.permissions ? JSON.parse(user.permissions) : [],
          department: user.department || undefined
        }
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('POST /api/auth/login error:', error)
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}
