import { db } from '../../../db/connection'
import { rolesPermission } from '../../../models/RolePermission'
import { count, desc } from 'drizzle-orm'

interface Params { pagination?: { currentPage: number; pageSize: number; all?: string } }

function parseRow(row: any) {
  return row // No parsing needed anymore, JSONB handles arrays natively
}

export async function getRolesPermissions_func({ pagination }: Params) {
  try {
    const page = pagination?.currentPage || 1
    const size = pagination?.pageSize || 10
    const all = pagination?.all === 'true'

    if (all) {
      const rows = await db.select().from(rolesPermission).orderBy(desc(rolesPermission.id))
      return { success: true, data: rows.map(parseRow), pagination: { total: rows.length, currentPage: 1, pageSize: rows.length } }
    }

    const offset = (page - 1) * size
    const rows = await db.select().from(rolesPermission).orderBy(desc(rolesPermission.id)).limit(size).offset(offset)
    const [totalRow] = await db.select({ total: count() }).from(rolesPermission)

    return {
      success: true,
      data: rows.map(parseRow),
      pagination: { total: Number(totalRow.total), currentPage: page, pageSize: size }
    }
  } catch (error) {
    console.error('Error fetching roles_permission:', error)
    return { success: false, message: 'Failed to fetch roles_permission' }
  }
}

