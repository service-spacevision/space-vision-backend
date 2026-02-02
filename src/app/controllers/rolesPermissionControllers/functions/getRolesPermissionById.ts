import { db } from '../../../db/connection'
import { rolesPermission } from '../../../models/RolePermission'
import { eq } from 'drizzle-orm'

interface Params { id: number }

export async function getRolesPermissionById_func({ id }: Params) {
  try {
    const [row] = await db.select().from(rolesPermission).where(eq(rolesPermission.id, id))
    if (!row) return { success: false, message: 'Roles permission not found' }
    return { success: true, data: row }
  } catch (error) {
    console.error('Error fetching roles_permission by id:', error)
    return { success: false, message: 'Failed to fetch roles_permission' }
  }
}

