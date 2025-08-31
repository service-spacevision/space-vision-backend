import { db } from '../../../db/connection'
import { userRoles } from '../../../models/UserRole'
import { eq } from 'drizzle-orm'

interface GetUserRoleByIdParams {
  roleId: string
}

export async function getUserRoleById_func({ roleId }: GetUserRoleByIdParams) {
  try {
    const [role] = await db.select()
      .from(userRoles)
      .where(eq(userRoles.id, roleId))
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