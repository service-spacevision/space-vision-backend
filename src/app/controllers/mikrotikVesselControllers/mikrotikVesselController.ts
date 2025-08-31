import { CustomContext } from '../../utils/types'
import { getMikrotikVessels_func } from './functions/getMikrotikVessels'
import { createMikrotikVessel_func } from './functions/createMikrotikVessel'
import { updateMikrotikVessel_func } from './functions/updateMikrotikVessel'
import { deleteMikrotikVessel_func } from './functions/deleteMikrotikVessel'

export class MikrotikVesselController {
  static async getMikrotikVessels(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!

      const result = await getMikrotikVessels_func({
        reqObject: { user },
        query: query as any
      })

      ctx.set.status = result?.success === true ? 200 : 404
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching mikrotik vessels'
      }
    }
  }

  static async createMikrotikVessel(ctx: CustomContext) {
    try {
      const { body } = ctx
      const user = ctx.user!

      const result = await createMikrotikVessel_func({
        reqObject: { user },
        data: body as any
      })

      ctx.set.status = result?.success === true ? 201 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while creating mikrotik vessel'
      }
    }
  }

  static async updateMikrotikVessel(ctx: CustomContext) {
    try {
      const { body, query } = ctx
      const user = ctx.user!

      const result = await updateMikrotikVessel_func({
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
        message: 'Internal server error while updating mikrotik vessel'
      }
    }
  }

  static async deleteMikrotikVessel(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!

      const result = await deleteMikrotikVessel_func({
        reqObject: { user },
        query: query as any
      })

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while deleting mikrotik vessel'
      }
    }
  }
}