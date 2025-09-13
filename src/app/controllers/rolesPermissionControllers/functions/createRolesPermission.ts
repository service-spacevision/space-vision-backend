import { db } from '../../../db/connection'
import { CreateRolePermissionData, rolesPermission } from '../../../models/RolePermission'

interface Params { data: CreateRolePermissionData }

export async function createRolesPermission_func({ data }: Params) {
  try {
    const [created] = await db.insert(rolesPermission).values({
      roleId: data.roleId,
      api_permissions: data.api_permissions ? JSON.stringify(data.api_permissions) : undefined,
      component_permissions: data.component_permissions ? JSON.stringify(data.component_permissions) : undefined,
      navigation_permissions: data.navigation_permissions ? JSON.stringify(data.navigation_permissions) : undefined,
    }).returning()

    const parsed = {
      ...created,
      api_permissions: created.api_permissions ? JSON.parse(created.api_permissions) : [],
      component_permissions: created.component_permissions ? JSON.parse(created.component_permissions) : [],
      navigation_permissions: created.navigation_permissions ? JSON.parse(created.navigation_permissions) : [],
    }

    return { success: true, message: 'Roles permission created successfully', data: parsed }
  } catch (error: any) {
    if (error?.code === '23505') {
      return { success: false, message: 'Permissions for this role already exist' }
    }
    console.error('Error creating roles_permission:', error)
    return { success: false, message: 'Failed to create roles_permission' }
  }
}

