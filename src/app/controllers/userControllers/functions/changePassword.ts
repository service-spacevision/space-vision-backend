import { db } from '../../../db/connection';
import { users } from '../../../models/User';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { ReqObjectType } from '../../../utils/types';
import { invalidateUserSessions } from '../../../middlewares/session';

export const changePassword_func = async (
  // reqObject: ReqObjectType,
  // { userId, data }: {
  //   userId: string;
  //   data: { currentPassword: string; newPassword: string }
  // }
  {
    reqObject,
    data,
  }: {
    reqObject: ReqObjectType;
    data: { currentPassword: string; newPassword: string };
  }
) => {
  try {
    const { currentPassword, newPassword } = data;

    // Validate input
    if (!currentPassword || !newPassword) {
      return {
        success: false,
        message: 'Current password and new password are required',
      };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        message: 'New password must be at least 8 characters long',
      };
    }

    // Get current user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(reqObject?.user?.id)))
      .limit(1);

    if (!user || !user.password) {
      return {
        success: false,
        message: 'User not found or no password set',
      };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        message: 'Current password is incorrect',
      };
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db
      .update(users)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, Number(reqObject.user?.id)));

    // Invalidate all existing sessions for security
    await invalidateUserSessions(Number(reqObject.user.id));

    return {
      success: true,
      message: 'Password changed successfully. Please log in again.',
    };
  } catch (error: any) {
    console.error('Change password error:', error);
    return {
      success: false,
      message: error.message || 'Failed to change password',
    };
  }
};
