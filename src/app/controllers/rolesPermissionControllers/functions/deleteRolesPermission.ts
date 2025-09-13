import { db } from '../../../db/connection'
import { rolesPermission } from '../../../models/RolePermission'
import { eq } from 'drizzle-orm'

interface Params { id: number }

export async function deleteRolesPermission_func({ id }: Params) {
  try {
    await db.delete(rolesPermission).where(eq(rolesPermission.id, id))
    return { success: true, message: 'Roles permission deleted successfully' }
  } catch (error) {
    console.error('Error deleting roles_permission:', error)
    return { success: false, message: 'Failed to delete roles_permission' }
  }
}

