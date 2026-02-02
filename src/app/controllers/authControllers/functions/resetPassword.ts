import { db } from '../../../db/connection'
import { users } from '../../../models/User'
import { eq, and, gt } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const resetPassword_func = async (
  {
    data
  }: {
    data: { token: string; newPassword: string }
  }
) => {
  try {
    const { token, newPassword } = data

    // Validate password
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters long'
      }
    }

    // Find user with valid reset token
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        passwordResetToken: users.passwordResetToken,
        passwordResetExpires: users.passwordResetExpires,
        isActive: users.isActive
      })
      .from(users)
      .where(
        and(
          eq(users.passwordResetToken, token),
          gt(users.passwordResetExpires, new Date())
        )
      )
      .limit(1)

    if (!user) {
      return {
        success: false,
        message: 'Invalid or expired reset token'
      }
    }

    if (!user.isActive) {
      return {
        success: false,
        message: 'Account is deactivated. Please contact support.'
      }
    }

    // Hash new password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password and clear reset token
    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))

    return {
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    }
  } catch (error: any) {
    console.error('Reset password error:', error)
    return {
      success: false,
      message: 'Failed to reset password'
    }
  }
}
