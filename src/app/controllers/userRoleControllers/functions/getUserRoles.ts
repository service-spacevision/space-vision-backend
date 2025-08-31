import { db } from '../../../db/connection'
import { userRoles } from '../../../models/UserRole'
import { eq, desc } from 'drizzle-orm'

interface GetUserRolesParams {
  includeInactive?: boolean
}

export async function getUserRoles_func({ includeInactive = false }: GetUserRolesParams = {}) {
  try {
    const whereCondition = includeInactive ? undefined : eq(userRoles.isActive, true)
    
    const roles = await db.select()
      .from(userRoles)
      .where(whereCondition)
      .orderBy(desc(userRoles.createdAt))

    return {
      success: true,
      message: 'User roles retrieved successfully',
      data: roles
    }
  } catch (error: any) {
    console.error('Error fetching user roles:', error)
    
    return {
      success: false,
      message: 'Failed to fetch user roles'
    }
  }
}