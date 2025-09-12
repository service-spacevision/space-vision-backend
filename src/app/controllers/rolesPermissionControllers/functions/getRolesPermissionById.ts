import { db } from '../../../db/connection'
import { rolesPermission } from '../../../models/RolePermission'
import { eq } from 'drizzle-orm'

interface Params { id: number }

export async function getRolesPermissionById_func({ id }: Params) {
  try {
    const [row] = await db.select().from(rolesPermission).where(eq(rolesPermission.id, id))
    if (!row) return { success: false, message: 'Roles permission not found' }
    const parsed = {
      ...row,
      api_permissions: row.api_permissions ? JSON.parse(row.api_permissions) : [],
      component_permissions: row.component_permissions ? JSON.parse(row.component_permissions) : [],
      navigation_permissions: row.navigation_permissions ? JSON.parse(row.navigation_permissions) : [],
    }
    return { success: true, data: parsed }
  } catch (error) {
    console.error('Error fetching roles_permission by id:', error)
    return { success: false, message: 'Failed to fetch roles_permission' }
  }
}

