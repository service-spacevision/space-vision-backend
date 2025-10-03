import jwt from 'jsonwebtoken'
import { JWT_CONFIG } from '../constants/constants'
import { getSession } from './session'
import { AuthUser } from '../utils/types'
export const authMiddleware = async ({
  cookieToken,
  permission
}: {
  cookieToken: string
  permission?: string
}) => {
  try {
    // Try to get token from cookie first, then Authorization header
    let token: string | undefined
    token = cookieToken
    if (!token) {
      return { success: false, message: "Token not found" }
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as any
    
    if (!decoded || !decoded.id) {
      return { success: false, message: 'Invalid token format' }
    }
    
    // Check if session exists and is valid
    const session = await getSession({ user_Id: Number(decoded.id) })
    if (!session || !session.isActive || new Date() > session.expiresAt) {
      return { success: false, message: 'Invalid or expired session' }
    }
    if(session.mfaEnabled && !session.mfaVerified) {
      if(permission === "verify_mfa_token"){
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
            mfaVerified: session.mfaVerified || false
          }
        }
        return { success: true, message: "verify token", data: user } 
      }
      return {
        success: false, 
        message: 'MFA not verified',
        data: {
          mfaEnabled: session.mfaEnabled,
          mfaVerified: session.mfaVerified
        }
      }
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
        mfaVerified: session.mfaVerified || false
      }
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
