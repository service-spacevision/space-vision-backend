import { db } from '../../../db/connection'
import { CreateRolePermissionData, rolesPermission } from '../../../models/RolePermission'

interface Params { data: CreateRolePermissionData }

export async function createRolesPermission_func({ data }: Params) {
  try {
    const [created] = await db.insert(rolesPermission).values({
      roleId: data.roleId,
      api_permissions: data.api_permissions || undefined,
      component_permissions: data.component_permissions || undefined,
      navigation_permissions: data.navigation_permissions || undefined,
    }).returning()

    return { success: true, message: 'Roles permission created successfully', data: created }
  } catch (error: any) {
    if (error?.code === '23505') {
      return { success: false, message: 'Permissions for this role already exist' }
    }
    console.error('Error creating roles_permission:', error)
    return { success: false, message: 'Failed to create roles_permission' }
  }
}

