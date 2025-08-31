import { db } from '../../../db/connection'
import { users } from '../../../models/User'
import { userRoles } from '../../../models/UserRole'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { ReqObjectType } from '../../../utils/types'
import { CreateUserData } from '../../../models/User'

export const signUpUser_func = async (
  {
    data
  }: {
    data: CreateUserData
  }
) => {
  try {
    const { email, password, fullName, username } = data
    console.log("data", data);
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      return {
        success: false,
        message: 'User with this email already exists'
      }
    }

    // Get default user role
    const [defaultRole] = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.name, 'user'))
      .limit(1)

    if (!defaultRole) {
      return {
        success: false,
        message: 'Default user role not found. Please contact administrator.'
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined
    if (password) {
      const saltRounds = 12
      hashedPassword = await bcrypt.hash(password, saltRounds)
    }

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        fullName,
        username,
        isActive: true,
        isEmailVerified: false,
        roleId: defaultRole.id
      })
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

    return {
      success: true,
      message: 'User created successfully',
      data: newUser
    }
  } catch (error: any) {
    console.error('Sign up error:', error)
    return {
      success: false,
      message: error.message || 'Failed to create user'
    }
  }
}