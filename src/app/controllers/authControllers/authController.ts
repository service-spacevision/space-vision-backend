import * as OTPAuth from 'otpauth';
import { CustomContext } from '../../utils/types';
import { signUpUser_func } from './functions/signUpUser';
import { signInUser_func } from './functions/signInUser';
import { invalidateUserSessions } from '../../middlewares/session';
import { verifyMfaToken_func } from './functions/verifyMFA';
import { requestPasswordReset_func } from './functions/requestPasswordReset';
import { resetPassword_func } from './functions/resetPassword';
import {
  checkLoginRateLimit,
  clearLoginFailures,
  getClientIp,
  getLoginRateLimitKey,
  registerLoginFailure,
} from '../../security/loginRateLimit';

export class AuthController {
  static async signUpUser(ctx: CustomContext) {
    try {
      const { body, user } = ctx;
      const result = await signUpUser_func({
        data: body as any,
        user: user as any,
      });

      ctx.set.status = result?.success === true ? 201 : 400;
      return result;
    } catch (err: any) {
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error during signup',
      };
    }
  }

  static async signIn(ctx: CustomContext) {
    try {
      const { body } = ctx;
      const normalizedEmail =
        typeof (body as any)?.email === 'string'
          ? (body as any).email.trim().toLowerCase()
          : 'unknown';
      const clientIp = getClientIp((ctx as any).request.headers as Headers);
      const rateLimitKey = getLoginRateLimitKey(clientIp, normalizedEmail);
      const rateLimitState = checkLoginRateLimit(rateLimitKey);

      if (rateLimitState.blocked) {
        ctx.set.status = 429;
        return {
          success: false,
          message: `Too many failed login attempts. Try again in ${rateLimitState.retryAfterSeconds} seconds.`,
        };
      }

      const result = await signInUser_func({
        data: body as any,
      });

      if (!result.success) {
        const failureState = registerLoginFailure(rateLimitKey);
        if (failureState.blockedNow) {
          ctx.set.status = 429;
          return {
            success: false,
            message: `Too many failed login attempts. Try again in ${failureState.retryAfterSeconds} seconds.`,
          };
        }
      } else {
        clearLoginFailures(rateLimitKey);
      }

      if (result.success && result.data?.token) {
        // Set JWT token as HTTP-only cookie
        ctx.cookie.jwt_token.set({
          value: result.data.token,
          httpOnly: process.env.PRODUCTION_MODE === 'false' ? false : true,
          sameSite: process.env.PRODUCTION_MODE === 'false' ? 'lax' : 'none',
          secure: process.env.PRODUCTION_MODE === 'false' ? false : true,
          maxAge: 24 * 60 * 60, // 24 hours
        });
      }

      ctx.set.status = result?.success === true ? 200 : 401;
      return result;
    } catch (err: any) {
      ctx.set.status = 500;
      return {
        success: false,
        message: err,
      };
    }
  }

  static async signOut(ctx: CustomContext) {
    try {
      const user = ctx.user;

      if (user) {
        // Invalidate all user sessions
        await invalidateUserSessions(Number(user.id));
      }

      // Clear JWT cookie
      ctx.cookie.jwt_token.remove();

      ctx.set.status = 200;
      return {
        success: true,
        message: 'User logged out successfully',
      };
    } catch (err: any) {
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error during logout',
      };
    }
  }

  static async refreshToken(ctx: CustomContext) {
    try {
      // This would typically involve validating the refresh token
      // and issuing a new access token
      // For now, we'll just return the current user info
      const user = ctx.user;

      if (!user) {
        ctx.set.status = 401;
        return {
          success: false,
          message: 'No valid session found',
        };
      }

      ctx.set.status = 200;
      return {
        success: true,
        message: 'Token refreshed successfully',
        data: { user },
      };
    } catch (err: any) {
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error during token refresh',
      };
    }
  }
  static async verifyMfaToken(ctx: CustomContext) {
    try {
      const { body, user } = ctx as any;
      const mfaVerified = await verifyMfaToken_func({
        code: body?.mfaCode,
        session: user,
        sessionId: user?.sessionId,
      });
      ctx.set.status = mfaVerified?.success === true ? 201 : 400;
      if (!mfaVerified.success) {
        return { success: false, message: mfaVerified.message };
      }
      return { success: true, message: 'MFA Verified' };
    } catch (err: any) {
      ctx.set.status = 500;
      return { success: false, message: err.message };
    }
  }

  static async requestPasswordReset(ctx: CustomContext) {
    try {
      const { body } = ctx;
      const result = await requestPasswordReset_func({
        data: body as any,
      });

      ctx.set.status = result?.success === true ? 200 : 400;
      return result;
    } catch (err: any) {
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error during password reset request',
      };
    }
  }

  static async resetPassword(ctx: CustomContext) {
    try {
      const { body } = ctx;
      const result = await resetPassword_func({
        data: body as any,
      });

      ctx.set.status = result?.success === true ? 200 : 400;
      return result;
    } catch (err: any) {
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error during password reset',
      };
    }
  }
}
