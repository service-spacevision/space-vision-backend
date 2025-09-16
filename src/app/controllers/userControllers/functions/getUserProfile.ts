import { db } from '../../../db/connection'
import { users } from '../../../models/User'
import { userRoles } from '../../../models/UserRole'
import { eq } from 'drizzle-orm'
import { ReqObjectType } from '../../../utils/types'

export const getUserProfile_func = async ({
  reqObject,
}: {
  reqObject: ReqObjectType,
}
) => {
  try {
    // Get user profile with role information
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        username: users.username,
        roleId: users.roleId,
        isActive: users.isActive,
        isEmailVerified: users.isEmailVerified,
        mfaEnabled: users.mfaEnabled,
        lastLoginAt: users.lastLoginAt,
        profilePicture: users.profilePicture,
        bio: users.bio,
        preferences: users.preferences,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        role: {
          id: userRoles.id,
          name: userRoles.name,
          displayName: userRoles.displayName,
        }
      })
      .from(users)
      .leftJoin(userRoles, eq(users.roleId, userRoles.id))
      .where(eq(users.id, Number(reqObject.user.id)))
      .limit(1)

    if (result.length === 0) {
      return {
        success: false,
        message: 'User not found'
      }
    }

    const userProfile = result[0]

    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: userProfile
    }
  } catch (error: any) {
    console.error('Get user profile error:', error)
    return {
      success: false,
      message: error.message || 'Failed to retrieve user profile'
    }
  }
}
