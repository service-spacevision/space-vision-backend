import { db } from '../../../db/connection'
import { UpdateRolePermissionData, rolesPermission } from '../../../models/RolePermission'
import { eq } from 'drizzle-orm'

interface Params { id: number; data: UpdateRolePermissionData }

export async function updateRolesPermission_func({ id, data }: Params) {
  try {
    const [updated] = await db.update(rolesPermission)
      .set({
        api_permissions: data.api_permissions ? JSON.stringify(data.api_permissions) : undefined,
        component_permissions: data.component_permissions ? JSON.stringify(data.component_permissions) : undefined,
        navigation_permissions: data.navigation_permissions ? JSON.stringify(data.navigation_permissions) : undefined,
      })
      .where(eq(rolesPermission.id, id))
      .returning()

    if (!updated) return { success: false, message: 'Roles permission not found' }

    const parsed = {
      ...updated,
      api_permissions: updated.api_permissions ? JSON.parse(updated.api_permissions) : [],
      component_permissions: updated.component_permissions ? JSON.parse(updated.component_permissions) : [],
      navigation_permissions: updated.navigation_permissions ? JSON.parse(updated.navigation_permissions) : [],
    }

    return { success: true, message: 'Roles permission updated successfully', data: parsed }
  } catch (error) {
    console.error('Error updating roles_permission:', error)
    return { success: false, message: 'Failed to update roles_permission' }
  }
}

