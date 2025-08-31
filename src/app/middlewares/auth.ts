import { Context } from 'elysia'
import jwt from 'jsonwebtoken'
import { JWT_CONFIG } from '../constants/constants'
import { getSession } from './session'
import { AuthUser } from '../utils/types'

export const authMiddleware = async (ctx: Context) => {
  try {
    // Try to get token from cookie first, then Authorization header
    console.log("ctx", ctx.cookie);
    
    let token: string | undefined
    
    // Try to get token from Elysia cookie object
    if (ctx.cookie && ctx.cookie.jwt_token) {
      token = ctx.cookie.jwt_token.value
    }
    
    // If no token from cookie object, parse from cookie header
    if (!token) {
      const cookieHeader = ctx.request.headers.get('cookie')
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          if (key && value) {
            acc[key] = value
          }
          return acc
        }, {} as Record<string, string>)
        token = cookies.jwt_token
      }
    }
    
    // If still no token, try Authorization header
    if (!token) {
      const authHeader = ctx.request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return { success: false, message: "Token not found" }
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

    return { success: true, message: "User found", data: user }
  } catch (error: any) {
    console.log("error", error);
    
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