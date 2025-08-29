import { db } from '../../../db/connection'
import { users } from '../../../models/User'
import { eq } from 'drizzle-orm'
import { ReqObjectType } from '../../../utils/types'
import { UpdateUserData } from '../../../models/User'

export const updateUserProfile_func = async (
  // reqObject: ReqObjectType,
  // { userId, data }: { userId: string; data: UpdateUserData }
  {
    reqObject,
    data
  }: {
    reqObject: ReqObjectType
    data: UpdateUserData
  }
) => {
  try {
    const { fullName, username, profilePicture, bio, preferences } = data

    // Only allow updating certain fields
    const updateData: Partial<UpdateUserData> = {}
    
    if (fullName !== undefined) updateData.fullName = fullName
    if (username !== undefined) updateData.username = username
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture
    if (bio !== undefined) updateData.bio = bio
    if (preferences !== undefined) updateData.preferences = preferences

    // Admin users can update additional fields
    if (reqObject.user?.role === 'admin') {
      if (data.isActive !== undefined) updateData.isActive = data.isActive
      if (data.role !== undefined) updateData.role = data.role
    }

    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        message: 'No valid fields to update'
      }
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(users.id, reqObject.user.id))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        username: users.username,
        role: users.role,
        isActive: users.isActive,
        isEmailVerified: users.isEmailVerified,
        mfaEnabled: users.mfaEnabled,
        profilePicture: users.profilePicture,
        bio: users.bio,
        preferences: users.preferences,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })

    if (!updatedUser) {
      return {
        success: false,
        message: 'User not found or update failed'
      }
    }

    return {
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    }
  } catch (error: any) {
    console.error('Update user profile error:', error)
    return {
      success: false,
      message: error.message || 'Failed to update user profile'
    }
  }
}