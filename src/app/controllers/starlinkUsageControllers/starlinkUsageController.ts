import { CustomContext } from '../../utils/types'
import { getStarlinkUsage_func } from './functions/getStarlinkUsage'
import { createStarlinkUsage_func } from './functions/createStarlinkUsage'
import { updateStarlinkUsage_func } from './functions/updateStarlinkUsage'
import { deleteStarlinkUsage_func } from './functions/deleteStarlinkUsage'
import { syncStarlinkUsage_func } from './functions/syncStarlinkUsage'
import { getStarlinkUsageByDateRange_func } from './functions/getStarlinkUsageByDateRange'
import { getStarlinkUsageKitData_func } from './functions/getStarlinkUsageKitData'
import { 
  getStarlinkUsageStats_func, 
  getStarlinkSystemSummary_func, 
  getTopUsageKits_func, 
  getUsageTrends_func 
} from './functions/getStarlinkUsageStats'

export class StarlinkUsageController {
  static async getStarlinkUsage(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!
      
      const pagination = {
        currentPage: Number(query?.currentPage) || 1,
        pageSize: Number(query?.pageSize) || 10,
        all: query?.all || "false"
      }

      const result = await getStarlinkUsage_func({
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

  static async syncStarlinkUsage(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!

      const result = await syncStarlinkUsage_func({
        reqObject: { user },
        datekey: query?.datekey as string
      })

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while syncing starlink usage'
      }
    }
  }

  static async getStarlinkUsageByDateRange(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!

      const result = await getStarlinkUsageByDateRange_func({
        reqObject: { user },
        startDate: query?.startDate as string,
        endDate: query?.endDate as string
      })

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching starlink usage by date range'
      }
    }
  }

  static async getStarlinkUsageKitData(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!

      if (!query.startDate || !query.endDate) {
        ctx.set.status = 400
        return {
          success: false,
          message: 'startDate and endDate query parameters are required'
        }
      }

      const pagination = {
        currentPage: Number(query?.currentPage) || 1,
        pageSize: Number(query?.pageSize) || 10,
        all: query?.all || "false"
      }

      const result = await getStarlinkUsageKitData_func({
        reqObject: { user },
        query: {
          startDate: query.startDate as string,
          endDate: query.endDate as string,
          kitNumber: query.kitNumber as string | undefined
        },
        pagination
      })

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching starlink usage kit data',
        error: err.message
      }
    }
  }

  static async getStarlinkUsageStats(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!

      const result = await getStarlinkUsageStats_func({
        reqObject: { user },
        kitNumber: query?.kitNumber as string
      })

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching starlink usage statistics'
      }
    }
  }

  static async getStarlinkSystemSummary(ctx: CustomContext) {
    try {
      const user = ctx.user!

      const result = await getStarlinkSystemSummary_func({
        reqObject: { user }
      })

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching starlink system summary'
      }
    }
  }

  static async getTopUsageKits(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!

      const result = await getTopUsageKits_func({
        reqObject: { user },
        limit: Number(query?.limit) || 10,
        period: (query?.period as '7' | '30' | '60' | 'lifetime') || '60'
      })

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching top usage kits'
      }
    }
  }

  static async getUsageTrends(ctx: CustomContext) {
    try {
      const user = ctx.user!

      const result = await getUsageTrends_func({
        reqObject: { user }
      })

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching usage trends'
      }
    }
  }
  
}