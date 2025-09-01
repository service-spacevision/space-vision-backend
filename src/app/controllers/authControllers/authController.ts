import { CustomContext } from '../../utils/types'
import { signUpUser_func } from './functions/signUpUser'
import { signInUser_func } from './functions/signInUser'
import { invalidateUserSessions } from '../../middlewares/session'

export class AuthController {
  static async signUpUser(ctx: CustomContext) {
    try {
      const { body } = ctx
      const result = await signUpUser_func(
        { data: body as any }
      )
      
      ctx.set.status = result?.success === true ? 201 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return { 
        success: false, 
        message: 'Internal server error during signup' 
      }
    }
  }

  static async signIn(ctx: CustomContext) {
    try {
      const { body } = ctx
      // const ipAddress = ctx.request.headers.get('x-forwarded-for') || 
      //                  ctx.request.headers.get('x-real-ip') || 
      //                  'unknown'
      // const userAgent = ctx.request.headers.get('user-agent') || 'unknown'

      const result = await signInUser_func(
        {
          data: body as any
        }
      )

      if (result.success && result.data?.token) {
        // Set JWT token as HTTP-only cookie
        ctx.cookie.jwt_token.set({
          value: result.data.token,
          httpOnly: process.env.PRODUCTION_MODE === "false" ? false : true,
          sameSite: process.env.PRODUCTION_MODE === "false" ? "lax" : "none",
          secure: process.env.PRODUCTION_MODE === "false" ? false : true,
          maxAge: 24 * 60 * 60 // 24 hours
        })
      }

      ctx.set.status = result?.success === true ? 200 : 401
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return { 
        success: false, 
        message: err
      }
    }
  }

  static async signOut(ctx: CustomContext) {
    try {
      const user = ctx.user

      if (user) {
        // Invalidate all user sessions
        await invalidateUserSessions(user.id)
      }

      // Clear JWT cookie
      ctx.cookie.jwt_token.remove()

      ctx.set.status = 200
      return { 
        success: true, 
        message: 'User logged out successfully' 
      }
    } catch (err: any) {
      ctx.set.status = 500
      return { 
        success: false, 
        message: 'Internal server error during logout' 
      }
    }
  }

  static async refreshToken(ctx: CustomContext) {
    try {
      // This would typically involve validating the refresh token
      // and issuing a new access token
      // For now, we'll just return the current user info
      const user = ctx.user

      if (!user) {
        ctx.set.status = 401
        return { 
          success: false, 
          message: 'No valid session found' 
        }
      }

      ctx.set.status = 200
      return { 
        success: true, 
        message: 'Token refreshed successfully',
        data: { user }
      }
    } catch (err: any) {
      ctx.set.status = 500
      return { 
        success: false, 
        message: 'Internal server error during token refresh' 
      }
    }
  }
}