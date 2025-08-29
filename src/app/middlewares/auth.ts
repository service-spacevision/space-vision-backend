import { Context } from 'elysia'
import jwt from 'jsonwebtoken'
import { JWT_CONFIG } from '../constants/constants'
import { getSession } from './session'
import { AuthUser } from '../utils/types'

export const authMiddleware = async (ctx: Context) => {
  try {
    // Try to get token from cookie first, then Authorization header
    let token = ctx.cookie.jwt_token?.value
    
    if (!token) {
      const authHeader = ctx.request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return { success: false, message: "Toekn not found" }
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as any
    
    if (!decoded || !decoded.id) {
      return { success: false, message: 'Invalid token format' }
    }

    // Check if session exists and is valid
    const session = await getSession({ user_Id: decoded.id })
    
    if (!session || !session.isActive || new Date() > session.expiresAt) {
      return { success: false, message: 'Invalid or expired session' }
    }

    // Attach user info to context
    const user: AuthUser = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      fullName: decoded.fullName,
      username: decoded.username
    }

    return { success: true, user }
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return { success: false, message: 'Token expired',  }
    }
    if (error.name === 'JsonWebTokenError') {
      return { success: false, message: 'Invalid token',  }
    }
    
    return { success: false, message: 'Authentication failed',}
  }
}

// export const requireAuth = async (ctx: Context) => {
//   const authResult = await authMiddleware(ctx)
  
//   if (!authResult.success) {
//     ctx.set.status = authResult.status || 401
//     return { success: false, error: authResult.error }
//   }
  
//   return authResult
// }