import { db } from '../../../db/connection'
import { users } from '../../../models/User'
import { userRoles } from '../../../models/UserRole'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_CONFIG } from '../../../constants/constants'
import { createSession } from '../../../middlewares/session'
import { ReqObjectType } from '../../../utils/types'

export const signInUser_func = async (
  {
    data }: {
      data: { email: string; password: string }
    }
) => {
  try {
    const body = data
    console.log("data", body);

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
          permissions: userRoles.permissions
        }
      })
      .from(users)
      .leftJoin(userRoles, eq(users.roleId, userRoles.id))
      .where(eq(users.email, body.email))
      .limit(1)

    const user = userWithRole

    if (!user) {
      console.log("its in here", user);

      return {
        success: false,
        message: 'Invalid email or password'
      }
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        message: 'Account is deactivated. Please contact support.'
      }
    }

    // Verify password
    console.log('Password verification:')
    console.log('Input password:', body.password)
    console.log('Stored hash:', user.password?.substring(0, 20) + '...')

    if (!user.password) {
      console.log('❌ No password stored for user')
      return {
        success: false,
        message: 'Invalid email or password'
      }
    }

    const passwordMatch = await bcrypt.compare(body.password, user.password)
    console.log('Password match result:', passwordMatch)

    if (!passwordMatch) {
      console.log('❌ Password does not match')
      return {
        success: false,
        message: 'Invalid email or password'
      }
    }

    console.log('✅ Password verified successfully')

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id))

    // Create JWT token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      // role: user.role,
      fullName: user.fullName,
      username: user.username
    }

    const token = jwt.sign(
      tokenPayload,
      JWT_CONFIG.SECRET as string,
      // {
      //   expiresIn: JWT_CONFIG.EXPIRES_IN as string
      // }
    )

    // Create session
    const session = await createSession({
      user_Id: user.id,
      token: token,
      sessionData: {
        loginTime: new Date(),
      },
    })

    // Return user data without sensitive information
    const { password, ...others } = user

    return {
      success: true,
      message: 'User logged in successfully',
      data: {
        user: others,
        token,
        sessionId: session.id
      }
    }
  } catch (error: any) {
    console.error('Sign in error:', error)
    return {
      success: false,
      message: error.message || 'Login failed'
    }
  }
}