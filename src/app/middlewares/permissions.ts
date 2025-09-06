import { Context } from "elysia";
import { authMiddleware } from "./auth";
import { UserRole } from "../utils/types";

export const checkUser = (permission) => {
  return async (ctx: Context) => {
    // First check authentication
    // console.log("ctx->data", ctx.cookie.jwt_token);
    let contextToken = ctx.cookie.jwt_token.value;
    if (!contextToken) {
      contextToken = ctx.headers.authorization?.split(" ")[1];
    }
    const authResult = await authMiddleware(contextToken);

    if (!authResult || !authResult.success) {
      ctx.set.status = 401;
      return authResult;
    }
    // if (!authResult.success) {
    //   ctx.set.status = authResult.status || 401
    //   return { success: false, error: authResult.error }
    // }

    // // Check if user has required permission
    // const userRole = ctx.user?.role as UserRole
    // const allowedRoles = PERMISSIONS[permission]

    // if (!userRole || !allowedRoles.includes(userRole)) {
    //   ctx.set.status = 403
    //   return {
    //     success: false,
    //     message: "Access denied"
    //   }
    // }
    (ctx as any).user = authResult.data;
    console.log("ctx->user", ctx);
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
