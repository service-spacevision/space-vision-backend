import { CustomContext } from '../../utils/types'
import { getTelephonyDids_func } from './functions/getTelephonyDids'
import { createTelephonyDid_func } from './functions/createTelephonyDid'
import { updateTelephonyDid_func } from './functions/updateTelephonyDid'
import { deleteTelephonyDid_func } from './functions/deleteTelephonyDid'

export class TelephonyDidController {
  static async getTelephonyDids(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!

      const result = await getTelephonyDids_func({
        reqObject: { user },
        query: query as any
      })

      ctx.set.status = result?.success === true ? 200 : 404
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching telephony DIDs'
      }
    }
  }

  static async createTelephonyDid(ctx: CustomContext) {
    try {
      const { body } = ctx
      const user = ctx.user!

      const result = await createTelephonyDid_func({
        reqObject: { user },
        data: body as any
      })

      ctx.set.status = result?.success === true ? 201 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while creating telephony DID'
      }
    }
  }

  static async updateTelephonyDid(ctx: CustomContext) {
    try {
      const { body, query } = ctx
      const user = ctx.user!

      const result = await updateTelephonyDid_func({
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
        message: 'Internal server error while updating telephony DID'
      }
    }
  }

  static async deleteTelephonyDid(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!

      const result = await deleteTelephonyDid_func({
        reqObject: { user },
        query: query as any
      })

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while deleting telephony DID'
      }
    }
  }
}