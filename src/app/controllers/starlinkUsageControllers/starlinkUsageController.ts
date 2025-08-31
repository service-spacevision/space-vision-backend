import { CustomContext } from '../../utils/types'
import { getStarlinkUsage_func } from './functions/getStarlinkUsage'
import { createStarlinkUsage_func } from './functions/createStarlinkUsage'
import { updateStarlinkUsage_func } from './functions/updateStarlinkUsage'
import { deleteStarlinkUsage_func } from './functions/deleteStarlinkUsage'

export class StarlinkUsageController {
  static async getStarlinkUsage(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!

      const result = await getStarlinkUsage_func({
        reqObject: { user },
        query: query as any
      })

      ctx.set.status = result?.success === true ? 200 : 404
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching starlink usage'
      }
    }
  }

  static async createStarlinkUsage(ctx: CustomContext) {
    try {
      const { body } = ctx
      const user = ctx.user!

      const result = await createStarlinkUsage_func({
        reqObject: { user },
        data: body as any
      })

      ctx.set.status = result?.success === true ? 201 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while creating starlink usage'
      }
    }
  }

  static async updateStarlinkUsage(ctx: CustomContext) {
    try {
      const { body, query } = ctx
      const user = ctx.user!

      const result = await updateStarlinkUsage_func({
        reqObject: { user },
        query: query as any,
        data: body as any
      })

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while updating starlink usage'
      }
    }
  }

  static async deleteStarlinkUsage(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!

      const result = await deleteStarlinkUsage_func({
        reqObject: { user },
        query: query as any
      })

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while deleting starlink usage'
      }
    }
  }
}