import { db } from '../../../db/connection'
import { userRoles } from '../../../models/UserRole'
import { rolesPermission } from '../../../models/RolePermission'
import { eq, desc, count } from 'drizzle-orm'
import { IPagination } from '../../../utils/types'

interface GetUserRolesParams {
  includeInactive?: boolean,
  pagination?: IPagination
}

export async function getUserRoles_func({
  includeInactive = false,
  pagination
}: GetUserRolesParams = {}) {
  try {
    const whereCondition = includeInactive ? undefined : eq(userRoles.isActive, true)

    // If pagination.all is set, return all records without pagination
    if (pagination?.all === 'true' || pagination?.all === '1') {
      const roles = await db.select({
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
        .where(whereCondition)
        .orderBy(desc(userRoles.createdAt))

      return {
        success: true,
        message: 'User roles retrieved successfully',
        data: roles,
        pagination: {
          total: roles.length,
          page: 1,
          pageSize: roles.length
        }
      }
    }

    // Default pagination values
    const page = pagination?.currentPage || 1
    const pageSize = pagination?.pageSize || 10
    const offset = (page - 1) * pageSize

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(userRoles)
      .where(whereCondition)

    const total = totalResult.count

    // Get paginated data
    const roles = await db.select({
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
      .where(whereCondition)
      .orderBy(desc(userRoles.createdAt))
      .limit(pageSize)
      .offset(offset)

    return {
      success: true,
      message: 'User roles retrieved successfully',
      data: roles,
      pagination: {
        total,
        page,
        pageSize
      }
    }
  } catch (error: any) {
    console.error('Error fetching user roles:', error)

    return {
      success: false,
      message: 'Failed to fetch user roles'
    }
  }
}