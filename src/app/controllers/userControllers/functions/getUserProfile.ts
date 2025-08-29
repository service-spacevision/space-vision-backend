import { db } from '../../../db/connection'
import { users } from '../../../models/User'
import { eq } from 'drizzle-orm'
import { ReqObjectType } from '../../../utils/types'

export const getUserProfile_func = async (
  reqObject: ReqObjectType,
  { userId }: { userId: string }
) => {
  try {
    // Get user profile
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        username: users.username,
        role: users.role,
        isActive: users.isActive,
        isEmailVerified: users.isEmailVerified,
        mfaEnabled: users.mfaEnabled,
        lastLoginAt: users.lastLoginAt,
        profilePicture: users.profilePicture,
        bio: users.bio,
        preferences: users.preferences,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(eq(users.id, userId))
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