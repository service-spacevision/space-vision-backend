import { CustomContext } from '../../utils/types'
import { getAllVesselsGrouped_func } from './functions/getAllVesselsGrouped'
import { getVessels_func } from './functions/getVessels'
import { createVessel_func } from './functions/createVessel'
import { updateVessel_func } from './functions/updateVessel'
import { deleteVessel_func } from './functions/deleteVessel'

export class VesselController {
  static async getAllVesselsGrouped(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!

      const result = await getAllVesselsGrouped_func({
        reqObject: { user },
        query: query as any
      })

      ctx.set.status = result?.success === true ? 200 : 404
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching vessels grouped by groups'
      }
    }
  }

  static async getVessels(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!
      
      const pagination = {
        currentPage: Number(query?.currentPage) || 1,
        pageSize: Number(query?.pageSize) || 10,
        all: query?.all || "false"
      }

      const result = await getVessels_func({
        reqObject: { user },
        query: query as any,
        pagination
      })

      ctx.set.status = result?.success === true ? 200 : 404
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching vessels'
      }
    }
  }

  static async createVessel(ctx: CustomContext) {
    try {
      const { body } = ctx
      const user = ctx.user!

      const result = await createVessel_func({
        reqObject: { user },
        data: body as any
      })

      ctx.set.status = result?.success === true ? 201 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while creating vessel'
      }
    }
  }

  static async updateVessel(ctx: CustomContext) {
    try {
      const { body, query } = ctx
      const user = ctx.user!

      const result = await updateVessel_func({
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
        message: 'Internal server error while updating vessel'
      }
    }
  }

  static async deleteVessel(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!

      const result = await deleteVessel_func({
        reqObject: { user },
        query: query as any
      })

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while deleting vessel'
      }
    }
  }
}