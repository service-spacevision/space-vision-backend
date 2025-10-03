import { db } from '../../../db/connection'
import { users } from '../../../models/User'
import { userRoles } from '../../../models/UserRole'
import { eq } from 'drizzle-orm'
import { ReqObjectType } from '../../../utils/types'
import { UpdateUserData } from '../../../models/User'
import { hasSystemRole } from '../../../utils/roleHelpers'
import bcrypt from 'bcryptjs'

export const updateUserProfileById_func = async (
  {
    reqObject,
    data,
    userId
  }: {
    reqObject: ReqObjectType
    data: UpdateUserData
    userId: string
  }
) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'User ID is required'
      }
    }

    const parsedUserId = Number(userId)

    if (Number.isNaN(parsedUserId)) {
      return {
        success: false,
        message: 'User ID must be a valid number'
      }
    }

    const { fullName, username, profilePicture, bio, preferences, password } = data

    // Only allow updating certain fields
    const updateData: Partial<UpdateUserData> = {}

    if (fullName !== undefined) updateData.fullName = fullName
    if (username !== undefined) updateData.username = username
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture
    if (bio !== undefined) updateData.bio = bio
    if (preferences !== undefined) updateData.preferences = preferences
    updateData.createdBy = reqObject.user.id

    // Check if the requesting user has system role
    const isSystemUser = await hasSystemRole(reqObject.user.id)
    console.log("its sytsem user", isSystemUser);

    // Get user's role to check permissions
    const [userWithRole] = await db
      .select({
        role: {
          ...userRoles
        }
      })
      .from(users)
      .leftJoin(userRoles, eq(users.roleId, userRoles.id))
      .where(eq(users.id, parsedUserId))
      .limit(1)

    // System users can update additional fields including password
    if (isSystemUser) {
      if (data.isActive !== undefined) updateData.isActive = data.isActive
      if (data.roleId !== undefined) updateData.roleId = data.roleId

      // Handle password update for system users only
      if (password !== undefined && password !== null) {
        if (password.length < 8) {
          return {
            success: false,
            message: 'Password must be at least 8 characters long'
          }
        }
        // Hash the new password
        const saltRounds = 12
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        updateData.password = hashedPassword
      }
    } else {
      // Non-system users cannot update password
      if (password !== undefined) {
        return {
          success: false,
          message: 'Only users with system roles can update passwords'
        }
      }

      // Legacy admin check for backward compatibility
      if (userWithRole?.role?.isSystem) {
        if (data.isActive !== undefined) updateData.isActive = data.isActive
        if (data.roleId !== undefined) updateData.roleId = data.roleId
        if (data.mfaEnabled !== undefined) updateData.mfaEnabled = data.mfaEnabled
      }
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
      .where(eq(users.id, parsedUserId))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        username: users.username,
        roleId: users.roleId,
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
