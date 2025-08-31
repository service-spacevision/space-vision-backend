import { db } from '../../../db/connection'
import { users } from '../../../models/User'
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

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1)

    if (!user) {
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
    if (!user.password || !await bcrypt.compare(body.password, user.password)) {
      return {
        success: false,
        message: 'Invalid email or password'
      }
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id))

    // Create JWT token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
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