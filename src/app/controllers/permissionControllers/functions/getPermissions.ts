import { db } from '../../../db/connection'
import { permissions } from '../../../models/Permission'
import { count, desc } from 'drizzle-orm'

interface Params {
  pagination?: { currentPage: number; pageSize: number; all?: string }
}

export async function getPermissions_func({ pagination }: Params) {
  try {
    const page = pagination?.currentPage || 1
    const size = pagination?.pageSize || 10
    const all = pagination?.all === 'true'

    if (all) {
      const rows = await db.select().from(permissions).orderBy(desc(permissions.id))
      return { success: true, data: rows, pagination: { total: rows.length, currentPage: 1, pageSize: rows.length } }
    }

    const offset = (page - 1) * size
    const rows = await db.select().from(permissions).orderBy(desc(permissions.id)).limit(size).offset(offset)
    const [totalRow] = await db.select({ total: count() }).from(permissions)

    return {
      success: true,
      data: rows,
      pagination: { total: Number(totalRow.total), currentPage: page, pageSize: size }
    }
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return { success: false, message: 'Failed to fetch permissions' }
  }
}

