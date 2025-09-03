import { db } from '../../../db/connection'
import { userRoles } from '../../../models/UserRole'
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

    const [role] = await db.select()
      .from(userRoles)
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