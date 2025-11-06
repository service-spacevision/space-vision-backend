import { db } from '../../../db/connection';
import { organizations } from '../../../models/Organization';
import { users } from '../../../models/User';
import { eq } from 'drizzle-orm';
import { encrypt } from '../../../utils/encryption';

export const generateAccessToken_func = async ({
  userId,
  organizationId,
}: {
  userId: number;
  organizationId: number;
}) => {
  try {
    // Verify user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Verify organization exists
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!organization) {
      return {
        success: false,
        message: 'Organization not found',
      };
    }

    const tokenPayload = {
      userId: user.id,
      organizationId: organization.id,
      createdAt: new Date().toISOString(),
    };

    const accessToken = await encrypt(JSON.stringify(tokenPayload));

    // store access token
    await db
      .update(organizations)
      .set({
        accessToken: accessToken,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, organizationId));

    return {
      success: true,
      message: 'Access token generated successfully',
      data: {
        accessToken,
        userId: user.id,
        organizationId: organization.id,
        organizationName: organization.name,
      },
    };
  } catch (error) {
    console.error('Error generating access token:', error);
    return {
      success: false,
      message: 'Failed to generate access token',
    };
  }
};
