import { db } from '../../../db/connection';
import { users } from '../../../models/User';
import { userRoles } from '../../../models/UserRole';
import { eq } from 'drizzle-orm';
import { ReqObjectType } from '../../../utils/types';
import { UpdateUserData } from '../../../models/User';
import { generateTOTP } from '../../authControllers/functions/verifyMFA';
import * as OTPAuth from 'otpauth';

export const updateUserProfile_func = async ({
  reqObject,
  data,
}: {
  reqObject: ReqObjectType;
  data: UpdateUserData & {
    mfaRegenerate?: boolean;
  };
}) => {
  try {
    const {
      fullName,
      username,
      profilePicture,
      bio,
      preferences,
      mfaEnabled,
      mfaRegenerate,
    } = data;

    // Only allow updating certain fields
    const updateData: Partial<UpdateUserData & { mfaSecret: string }> = {};

    if (fullName !== undefined) updateData.fullName = fullName;
    if (username !== undefined) updateData.username = username;
    if (profilePicture !== undefined)
      updateData.profilePicture = profilePicture;
    if (bio !== undefined) updateData.bio = bio;
    if (preferences !== undefined) updateData.preferences = preferences;
    if (mfaEnabled !== undefined) updateData.mfaEnabled = mfaEnabled;

    // Get user's role to check permissions
    const [userWithRole] = await db
      .select({
        role: {
          ...userRoles,
        },
      })
      .from(users)
      .leftJoin(userRoles, eq(users.roleId, userRoles.id))
      .where(eq(users.id, Number(reqObject.user.id)))
      .limit(1);

    // Admin users can update additional fields
    if (userWithRole?.role?.isSystem) {
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.roleId !== undefined) updateData.roleId = data.roleId;
    }
    let totpUrl = null;
    let secret = null;
    if (mfaEnabled && mfaRegenerate) {
      secret = new OTPAuth.Secret();
      const totp = generateTOTP(secret.base32, 'Space Vision');
      totpUrl = totp.toString();
      updateData.mfaSecret = secret.base32;
    }
    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        message: 'No valid fields to update',
      };
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, Number(reqObject.user.id)))
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
        updatedAt: users.updatedAt,
      });
    console.log('updatedUser', reqObject.user);

    if (!updatedUser) {
      return {
        success: false,
        message: 'User not found or update failed',
      };
    }

    return {
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...updatedUser,
        // mfaSecret: secret,
        totpUrl: totpUrl,
      },
    };
  } catch (error: any) {
    console.error('Update user profile error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update user profile',
    };
  }
};
