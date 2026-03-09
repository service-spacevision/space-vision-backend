import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../constants/constants';
import { getSession } from './session';
import { AuthUser } from '../utils/types';
import { db } from '../db/connection';
import { organizations } from '../models/Organization';
import { users } from '../models/User';
import { eq } from 'drizzle-orm';
import { decrypt } from '../utils/encryption';
import { userRoles } from '../models/UserRole';

export const authMiddleware = async ({
  cookieToken,
  permission,
}: {
  cookieToken: string;
  permission?: string;
}) => {
  try {
    // Try to get token from cookie first, then Authorization header
    let token: string | undefined;
    token = cookieToken;
    if (!token) {
      return { success: false, message: 'Token not found' };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as any;

    if (!decoded || !decoded.id) {
      return { success: false, message: 'Invalid token format' };
    }

    // Check if session exists and is valid
    const session = await getSession({ user_Id: Number(decoded.id) });
    if (!session || !session.isActive || new Date() > session.expiresAt) {
      return { success: false, message: 'Invalid or expired session' };
    }
    if (session.mfaEnabled === true && session.mfaVerified === false) {
      if (permission === 'verify_mfa_token') {
        const user: AuthUser = {
          id: decoded.id,

          sessionId: session.id,
          email: decoded.email,
          role: decoded.role,
          fullName: decoded.fullName,
          username: decoded.username,
          organizationId: decoded.organizationId,
          sessionInfo: {
            mfaEnabled: session.mfaEnabled || false,
            mfaVerified: session.mfaVerified || false,
          },
        };
        return { success: true, message: 'verify token', data: user };
      }

      return {
        success: false,
        message: 'MFA not verified',
        data: {
          mfaEnabled: session.mfaEnabled,
          mfaVerified: session.mfaVerified,
        },
      };
    }
    // Attach user info to context
    const user: AuthUser = {
      id: decoded.id,
      sessionId: session.id,
      email: decoded.email,
      role: decoded.role,
      fullName: decoded.fullName,
      username: decoded.username,
      organizationId: decoded.organizationId,
      sessionInfo: {
        mfaEnabled: session.mfaEnabled || false,
        mfaVerified: session.mfaVerified || false,
      },
    };

    return { success: true, message: 'User found', data: user };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return { success: false, message: 'Token expired' };
    }
    if (error.name === 'JsonWebTokenError') {
      return { success: false, message: 'Invalid token' };
    }

    return { success: false, message: 'Authentication failed' };
  }
};

// export const requireAuth = async (ctx: Context) => {
//   const authResult = await authMiddleware(ctx)

//   if (!authResult.success) {
//     ctx.set.status = authResult.status || 401
//     return { success: false, error: authResult.error }
//   }

//   return authResult
// }

export const orgAccessToken = async (token: string) => {
  try {
    // Decrypt the token

    const decryptedData = await decrypt(token);
    const decoded = JSON.parse(decryptedData);

    if (!decoded || !decoded.userId || !decoded.organizationId) {
      return { success: false, message: 'Invalid access token format' };
    }

    // Find the organization
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, decoded.organizationId))
      .limit(1);

    if (!organization) {
      return { success: false, message: 'Organization not found' };
    }

    // Verify the token matches the stored access token
    if (organization.accessToken !== token) {
      return { success: false, message: 'Invalid access token' };
    }

    // Find the user with their role
    const [userWithRole] = await db
      .select({
        user: users,
        role: {
          id: users.roleId,
        },
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!userWithRole || !userWithRole.user) {
      return { success: false, message: 'User not found' };
    }

    const user = userWithRole.user;

    // Fetch the user's role details if roleId exists
    let userRole = undefined;
    if (user.roleId) {
      const [roleData] = await db
        .select()
        .from(userRoles)
        .where(eq(userRoles.id, user.roleId))
        .limit(1);
      userRole = roleData;
    }

    const authUser: AuthUser = {
      id: user.id.toString(),
      email: user.email,
      role: userRole,
      fullName: user.fullName || undefined,
      username: user.username || undefined,
      organizationId: organization.id,
      sessionInfo: {
        mfaEnabled: false,
        mfaVerified: true, // bypasses MFA
      },
    };

    return { success: true, message: 'Access token verified', data: authUser };
  } catch (error: any) {
    console.error('orgAccessToken error:', error);

    return { success: false, message: 'Access token verification failed' };
  }
};
