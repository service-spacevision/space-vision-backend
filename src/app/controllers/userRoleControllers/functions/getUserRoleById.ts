import { db } from '../../../db/connection'
import { userRoles } from '../../../models/UserRole'
import { rolesPermission } from '../../../models/RolePermission'
import { eq } from 'drizzle-orm'

interface GetUserRoleByIdParams {
  roleId: string | number
}

export async function getUserRoleById_func({ roleId }: GetUserRoleByIdParams) {
  try {
    // Convert roleId to number since userRoles.id is a serial (number)
    const idNum = typeof roleId === 'string' ? Number(roleId) : roleId

    if (!Number.isInteger(idNum)) {
      return {
        success: false,
        message: 'Invalid role id'
      }
    }

    const [role] = await db.select({
      id: userRoles.id,
      name: userRoles.name,
      displayName: userRoles.displayName,
      description: userRoles.description,
      isActive: userRoles.isActive,
      isSystem: userRoles.isSystem,
      created_by: userRoles.created_by,
      organizationId: userRoles.organizationId,
      createdAt: userRoles.createdAt,
      updatedAt: userRoles.updatedAt,
      permissions: {
        api_permissions: rolesPermission.api_permissions,
        component_permissions: rolesPermission.component_permissions,
        navigation_permissions: rolesPermission.navigation_permissions
      }
    })
      .from(userRoles)
      .leftJoin(rolesPermission, eq(userRoles.id, rolesPermission.roleId))
      .where(eq(userRoles.id, idNum))
      .limit(1)

    if (!role) {
      return {
        success: false,
        message: 'User role not found'
      }
    }

    return {
      success: true,
      message: 'User role retrieved successfully',
      data: role
    }
  } catch (error: any) {
    console.error('Error fetching user role:', error)
    
    return {
      success: false,
      message: 'Failed to fetch user role'
    }
  }
}