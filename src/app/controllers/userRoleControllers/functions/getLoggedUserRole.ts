import { db } from '../../../db/connection'
import { users } from '../../../models/User'
import { userRoles } from '../../../models/UserRole'
import { rolesPermission } from '../../../models/RolePermission'
import { eq } from 'drizzle-orm'
import { ReqObjectType } from '../../../utils/types'

interface GetLoggedUserRoleParams {
  reqObject: ReqObjectType
}

export async function getLoggedUserRole_func({ reqObject }: GetLoggedUserRoleParams) {
  try {
    const userId = reqObject.user.id

    // Get user with their role and permissions
    const [userWithRole] = await db.select({
      user: {
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        username: users.username,
        roleId: users.roleId
      },
      role: {
        id: userRoles.id,
        name: userRoles.name,
        displayName: userRoles.displayName,
        description: userRoles.description,
        isActive: userRoles.isActive,
        isSystem: userRoles.isSystem
      },
      permissions: {
        api_permissions: rolesPermission.api_permissions,
        component_permissions: rolesPermission.component_permissions,
        navigation_permissions: rolesPermission.navigation_permissions
      }
    })
      .from(users)
      .leftJoin(userRoles, eq(users.roleId, userRoles.id))
      .leftJoin(rolesPermission, eq(userRoles.id, rolesPermission.roleId))
      .where(eq(users.id, Number(userId)))
      .limit(1)

    if (!userWithRole) {
      return {
        success: false,
        message: 'User not found'
      }
    }

    // Parse JSON permissions if they exist, with proper type safety
    const permissions = userWithRole.permissions || {
      api_permissions: '[]',
      component_permissions: '[]',
      navigation_permissions: '[]'
    };
    
    const parsedPermissions = {
      api_permissions: permissions.api_permissions 
        ? JSON.parse(permissions.api_permissions) 
        : [],
      component_permissions: permissions.component_permissions 
        ? JSON.parse(permissions.component_permissions) 
        : [],
      navigation_permissions: permissions.navigation_permissions 
        ? JSON.parse(permissions.navigation_permissions) 
        : []
    }

    return {
      success: true,
      message: 'User role retrieved successfully',
      data: {
        user: userWithRole.user,
        role: userWithRole.role,
        permissions: parsedPermissions
      }
    }
  } catch (error: any) {
    console.error('Error fetching logged user role:', error)
    
    return {
      success: false,
      message: 'Failed to fetch user role'
    }
  }
}