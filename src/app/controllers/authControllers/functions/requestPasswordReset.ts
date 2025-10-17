import { db } from '../../../db/connection';
import { users } from '../../../models/User';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../../../utils/emailService';

export const requestPasswordReset_func = async ({
  data,
}: {
  data: { email: string };
}) => {
  try {
    const { email } = data;

    // Find user by email
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Check if user exists
    if (!user) {
      return {
        success: false,
        message: 'User does not exist with this email address.',
      };
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        message: 'Account is deactivated. Please contact support.',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await db
      .update(users)
      .set({
        passwordResetToken: resetToken,
        passwordResetExpires: resetTokenExpiry,
      })
      .where(eq(users.id, user.id));

    // Send password reset email
    try {
      await sendPasswordResetEmail({
        email: user.email,
        fullName: user.fullName || 'User',
        resetToken,
      });
    } catch (emailError: any) {
      console.error('Failed to send password reset email:', emailError);
      // Clear the reset token if email fails
      await db
        .update(users)
        .set({
          passwordResetToken: null,
          passwordResetExpires: null,
        })
        .where(eq(users.id, user.id));

      return {
        success: false,
        message: 'Failed to send password reset email. Please try again later.',
      };
    }

    return {
      success: true,
      message: 'Password reset link has been sent to your email address.',
    };
  } catch (error: any) {
    console.error('Request password reset error:', error);
    return {
      success: false,
      message: 'Failed to process password reset request',
    };
  }
};
