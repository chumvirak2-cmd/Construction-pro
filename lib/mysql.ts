import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

function parseDatabaseUrl(url: string): { host: string; port: number; user: string; password: string; database: string } {
  try {
    const parsed = new URL(url)
    return {
      host: parsed.hostname,
      port: Number(parsed.port) || 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.slice(1)
    }
  } catch {
    return { host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'construction_pro' }
  }
}

export function getMySQLPool(): mysql.Pool {
  if (!pool) {
    const databaseUrl = process.env.MYSQL_HOST

    if (databaseUrl?.startsWith('mysql://') || databaseUrl?.startsWith('mysql2://')) {
      const config = parseDatabaseUrl(databaseUrl.replace('mysql2://', 'mysql://'))
      pool = mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      })
    } else {
      pool = mysql.createPool({
        host: process.env.MYSQL_HOST || '127.0.0.1',
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'construction_pro',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      })
    }
  }

  return pool
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const connection = await getMySQLPool().getConnection()
  try {
    const [rows] = await connection.execute(sql, params)
    return rows as T[]
  } finally {
    connection.release()
  }
}

export async function getMySQLConnection() {
  return getMySQLPool().getConnection()
}

export async function closeMySQLPool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}