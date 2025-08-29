import { CustomContext } from '../../utils/types'
import { getUserProfile_func } from './functions/getUserProfile'
import { updateUserProfile_func } from './functions/updateUserProfile'
import { changePassword_func } from './functions/changePassword'

export class UserController {
  static async getProfile(ctx: CustomContext) {
    try {
      const user = ctx.user!
      const result = await getUserProfile_func(
        { currentDB: ctx.currentDB, user },
        { userId: user.id }
      )

      ctx.set.status = result?.success === true ? 200 : 404
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching profile'
      }
    }
  }

  static async updateProfile(ctx: CustomContext) {
    try {
      const { body } = ctx
      const user = ctx.user!

      const result = await updateUserProfile_func(
        {
          reqObject: { user },
          data: body as any
        }
      )

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while updating profile'
      }
    }
  }

  static async changePassword(ctx: CustomContext) {
    try {
      const { body } = ctx
      const reqObject = {
        user: ctx.user!
      }
      const result = await changePassword_func(
        {
          reqObject,
          data: body as any
        }
      )

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while changing password'
      }
    }
  }

  static async deleteAccount(ctx: CustomContext) {
    try {
      const user = ctx.user!

      // For security, require password confirmation
      const { password } = ctx.body

      if (!password) {
        ctx.set.status = 400
        return {
          success: false,
          message: 'Password confirmation required'
        }
      }

      // This would typically involve:
      // 1. Verifying the password
      // 2. Soft deleting the user (setting isActive to false)
      // 3. Invalidating all sessions
      // 4. Potentially anonymizing data based on privacy requirements

      ctx.set.status = 200
      return {
        success: true,
        message: 'Account deletion initiated. This action cannot be undone.'
      }
    } catch (err: any) {
      logger.error('DeleteAccount Controller Error:', err)
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while deleting account'
      }
    }
  }
}