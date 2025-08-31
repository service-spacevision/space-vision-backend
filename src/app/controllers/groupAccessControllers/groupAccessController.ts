import { CustomContext } from '../../utils/types'
import { getGroupAccess_func } from './functions/getGroupAccess'
import { createGroupAccess_func } from './functions/createGroupAccess'
import { updateGroupAccess_func } from './functions/updateGroupAccess'
import { deleteGroupAccess_func } from './functions/deleteGroupAccess'

export class GroupAccessController {
  static async getGroupAccess(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!

      const result = await getGroupAccess_func({
        reqObject: { user },
        query: query as any
      })

      ctx.set.status = result?.success === true ? 200 : 404
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching group access'
      }
    }
  }

  static async createGroupAccess(ctx: CustomContext) {
    try {
      const { body } = ctx
      const user = ctx.user!

      const result = await createGroupAccess_func({
        reqObject: { user },
        data: body as any
      })

      ctx.set.status = result?.success === true ? 201 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while creating group access'
      }
    }
  }

  static async updateGroupAccess(ctx: CustomContext) {
    try {
      const { body, query } = ctx
      const user = ctx.user!

      const result = await updateGroupAccess_func({
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
        message: 'Internal server error while updating group access'
      }
    }
  }

  static async deleteGroupAccess(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!

      const result = await deleteGroupAccess_func({
        reqObject: { user },
        query: query as any
      })

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while deleting group access'
      }
    }
  }
}