import { db } from '../../../db/connection'
import { UpdateRolePermissionData, rolesPermission } from '../../../models/RolePermission'
import { eq } from 'drizzle-orm'

interface Params { id: number; data: UpdateRolePermissionData }

export async function updateRolesPermission_func({ id, data }: Params) {
  try {
    const [updated] = await db.update(rolesPermission)
      .set({
        api_permissions: data.api_permissions || undefined,
        component_permissions: data.component_permissions || undefined,
        navigation_permissions: data.navigation_permissions || undefined,
      })
      .where(eq(rolesPermission.id, id))
      .returning()

    if (!updated) return { success: false, message: 'Roles permission not found' }

    return { success: true, message: 'Roles permission updated successfully', data: updated }
  } catch (error) {
    console.error('Error updating roles_permission:', error)
    return { success: false, message: 'Failed to update roles_permission' }
  }
}

