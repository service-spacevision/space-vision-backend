import { db } from '../../../db/connection'
import { users } from '../../../models/User'
import { userRoles } from '../../../models/UserRole'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_CONFIG } from '../../../constants/constants'
import { createSession } from '../../../middlewares/session'
import { rolesPermission } from '../../../models/RolePermission'

export const signInUser_func = async (
  {
    data,
  }: {
    data: { email: string; password: string }
  },
) => {
  try {
    const body = data

    // Find user by email with role information
    const [userWithRole] = await db
      .select({
        id: users.id,
        email: users.email,
        password: users.password,
        fullName: users.fullName,
        username: users.username,
        roleId: users.roleId,
        isActive: users.isActive,
        isEmailVerified: users.isEmailVerified,
        mfaEnabled: users.mfaEnabled,
        mfaSecret: users.mfaSecret,
        lastLoginAt: users.lastLoginAt,
        profilePicture: users.profilePicture,
        organizationId: users.organizationId,
        bio: users.bio,
        preferences: users.preferences,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        role: {
          ...userRoles,
        },
        permissions: {
          ...rolesPermission,
        },
      })
      .from(users)
      .leftJoin(userRoles, eq(users.roleId, userRoles.id))
      .leftJoin(rolesPermission, eq(users.roleId, rolesPermission.id))
      .where(eq(users.email, body.email))
      .limit(1)

    const user = userWithRole

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password',
      }
    }

    if (!user.isActive) {
      return {
        success: false,
        message: 'Account is deactivated. Please contact support.',
      }
    }

    if (!user.password) {
      return {
        success: false,
        message: 'Invalid email or password',
      }
    }

    const passwordMatch = await bcrypt.compare(body.password, user.password)

    if (!passwordMatch) {
      return {
        success: false,
        message: 'Invalid email or password',
      }
    }

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id))

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      username: user.username,
      organizationId: user.organizationId,
    }

    const token = jwt.sign(tokenPayload, JWT_CONFIG.SECRET as string)

    const session = await createSession({
      user_Id: user.id,
      token,
      mfaEnabled: user.mfaEnabled || false,
      mfaVerified: false,
      sessionData: {
        loginTime: new Date(),
      },
    })

    const { password, ...others } = user

    return {
      success: true,
      message: 'User logged in successfully',
      data: {
        user: others,
        token,
        sessionId: session.id,
        ...(user.mfaEnabled && { mfaEnabled: user.mfaEnabled }),
      },
    }
  } catch (error: any) {
    console.error('Sign in error:', error)
    return {
      success: false,
      message: error.message || 'Login failed',
    }
  }
}
