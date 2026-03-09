import { Context } from 'elysia';
import { authMiddleware, orgAccessToken } from './auth';
import { db } from '../db/connection';
import { users } from '../models/User';
import { userRoles } from '../models/UserRole';
import { rolesPermission } from '../models/RolePermission';
import { eq } from 'drizzle-orm';

const shouldMaskProtectedRoutes =
  process.env.MASK_PROTECTED_ROUTES === 'true' ||
  process.env.NODE_ENV === 'production';

const handleUnauthenticated = (ctx: Context, fallback: any) => {
  if (shouldMaskProtectedRoutes) {
    ctx.set.status = 404;
    return {
      success: false,
      message: 'Route not found',
      status: 404,
    };
  }

  ctx.set.status = 401;
  return fallback;
};

function normalizePermissionList(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((v) => String(v).trim())
      .filter((v) => v.length > 0);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((v) => String(v).trim())
          .filter((v) => v.length > 0);
      }
    } catch {}

    return trimmed
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }

  return [];
}

async function hasApiPermission(userId: number, requiredPermission: string) {
  const [userWithRole] = await db
    .select({
      roleId: users.roleId,
      roleName: userRoles.name,
      roleIsSystem: userRoles.isSystem,
      apiPermissions: rolesPermission.api_permissions,
    })
    .from(users)
    .leftJoin(userRoles, eq(users.roleId, userRoles.id))
    .leftJoin(rolesPermission, eq(users.roleId, rolesPermission.roleId))
    .where(eq(users.id, userId))
    .limit(1);

  if (!userWithRole) {
    return {
      allowed: false,
      reason: 'User role not found',
      apiPermissions: [] as string[],
      roleName: undefined as string | undefined,
    };
  }

  const roleName = (userWithRole.roleName || '').toLowerCase();
  const isSystemBypass =
    userWithRole.roleIsSystem === true ||
    roleName === 'system' ||
    roleName === 'admin';

  const apiPermissions = normalizePermissionList(userWithRole.apiPermissions);

  if (
    isSystemBypass ||
    apiPermissions.includes('*') ||
    apiPermissions.includes(requiredPermission)
  ) {
    return {
      allowed: true,
      reason: '',
      apiPermissions,
      roleName: userWithRole.roleName || undefined,
    };
  }

  return {
    allowed: false,
    reason: `Missing permission: ${requiredPermission}`,
    apiPermissions,
    roleName: userWithRole.roleName || undefined,
  };
}

export const checkUser = (permission: string) => {
  return async (ctx: Context) => {
    // Check for "x-space-context" header first
    const spaceContextToken = ctx.headers['x-space-context'];
    
    if (spaceContextToken) {
      const orgAuthResult = await orgAccessToken(spaceContextToken);

      if (!orgAuthResult || !orgAuthResult.success) {
        return handleUnauthenticated(ctx, orgAuthResult);
      }

      const userData = orgAuthResult.data as any;
      const permissionCheck = await hasApiPermission(
        Number(userData.id),
        permission,
      );
      if (!permissionCheck.allowed) {
        ctx.set.status = 403;
        return {
          success: false,
          message: permissionCheck.reason || 'Access denied',
          permission,
        };
      }

      userData.permissions = {
        api_permissions: permissionCheck.apiPermissions,
      };
      (ctx as any).user = userData;
      return;
    }

    // console.log("ctx->data", ctx.cookie.jwt_token);
    let contextToken =
      ctx.cookie.jwt_token.value || ctx.cookie['auth-token'].value;
    if (!contextToken) {
      contextToken = ctx.headers.authorization?.split(' ')[1];
    }
    const authResult = await authMiddleware({
      cookieToken: contextToken!,
      permission: permission,
    });

    if (!authResult || !authResult.success) {
      return handleUnauthenticated(ctx, authResult);
    }

    const userData = authResult.data as any;
    const permissionCheck = await hasApiPermission(Number(userData.id), permission);
    if (!permissionCheck.allowed) {
      ctx.set.status = 403;
      return {
        success: false,
        message: permissionCheck.reason || 'Access denied',
        permission,
      };
    }

    userData.permissions = {
      api_permissions: permissionCheck.apiPermissions,
    };
    (ctx as any).user = userData;
    return;
  };
};

// export const requireRole = (roles: UserRole[]) => {
//   return async (ctx: Context) => {
//     const authResult = await authMiddleware(ctx)

//     if (!authResult.success) {
//       ctx.set.status = authResult.status || 401
//       return { success: false, error: authResult.error }
//     }

//     const userRole = ctx.user?.role as UserRole

//     if (!userRole || !roles.includes(userRole)) {
//       ctx.set.status = 403
//       return {
//         success: false,
//         error: 'Access denied',
//         required: roles,
//         current: userRole
//       }
//     }

//     return { success: true }
//   }
// }

// export const requireAdmin = requireRole(['admin'])
// export const requireModerator = requireRole(['admin', 'moderator'])

// // Resource-specific permissions
// export const checkResourceAccess = (resourceType: 'user' | 'system') => {
//   return async (ctx: Context) => {
//     const authResult = await authMiddleware(ctx)

//     if (!authResult.success) {
//       ctx.set.status = authResult.status || 401
//       return { success: false, error: authResult.error }
//     }

//     const user = ctx.user!
//     const targetUserId = ctx.params?.id || ctx.params?.userId

//     // Admin can access any resource
//     if (user.role === 'admin') {
//       return { success: true }
//     }

//     // Users can only access their own resources
//     if (resourceType === 'user' && targetUserId && user.id !== targetUserId) {
//       ctx.set.status = 403
//       return {
//         success: false,
//         error: 'Access denied to this resource'
//       }
//     }

//     return { success: true }
//   }
// }
