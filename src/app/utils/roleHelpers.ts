import { db } from '../db/connection'
import { users } from '../models/User'
import { userRoles } from '../models/UserRole'
import { eq } from 'drizzle-orm'

/**
 * Check if a user has a system role (isSystem: true)
 * @param userId - The user ID to check
 * @returns Promise<boolean> - True if user has a system role, false otherwise
 */
export async function hasSystemRole(userId: string | number): Promise<boolean> {
  try {
    const result = await db
      .select({
        isSystem: userRoles.isSystem
      })
      .from(users)
      .leftJoin(userRoles, eq(users.roleId, userRoles.id))
      .where(eq(users.id, Number(userId)))
      .limit(1)

    return result.length > 0 && result[0].isSystem === true
  } catch (error) {
    console.error('Error checking system role:', error)
    return false
  }
}