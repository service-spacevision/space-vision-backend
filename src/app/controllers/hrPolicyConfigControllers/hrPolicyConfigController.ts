import { CustomContext } from '../../utils/types'
import { applyHrPolicyConfig_func } from './functions/applyHrPolicyConfig'
import { assignHrPolicyToEmployees_func } from './functions/assignHrPolicyToEmployees'
import { createHrPolicyConfig_func } from './functions/createHrPolicyConfig'
import { deleteHrPolicyConfig_func } from './functions/deleteHrPolicyConfig'
import { getHrPolicyConfig_func } from './functions/getHrPolicyConfig'
import { listHrPolicyConfigs_func } from './functions/listHrPolicyConfigs'
import { updateHrPolicyConfig_func } from './functions/updateHrPolicyConfig'

export class HrPolicyConfigController {
  static async create(ctx: CustomContext) {
    try {
      const result = await createHrPolicyConfig_func({
        reqObject: { user: ctx.user! },
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 201 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while creating HR policy',
      }
    }
  }

  static async apply(ctx: CustomContext) {
    try {
      const result = await applyHrPolicyConfig_func({
        reqObject: { user: ctx.user! },
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while applying HR policy',
      }
    }
  }

  static async getCurrent(ctx: CustomContext) {
    try {
      const organizationId = ctx.query?.organizationId
        ? Number(ctx.query.organizationId)
        : undefined
      if (ctx.query?.organizationId && isNaN(Number(ctx.query.organizationId))) {
        ctx.set.status = 400
        return {
          success: false,
          message: 'Invalid organizationId query parameter',
        }
      }

      const result = await getHrPolicyConfig_func({
        reqObject: { user: ctx.user! },
        organizationId,
      })
      ctx.set.status = result?.success ? 200 : 404
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching HR policy',
      }
    }
  }

  static async list(ctx: CustomContext) {
    try {
      const organizationId = ctx.query?.organizationId
        ? Number(ctx.query.organizationId)
        : undefined
      if (ctx.query?.organizationId && isNaN(Number(ctx.query.organizationId))) {
        ctx.set.status = 400
        return {
          success: false,
          message: 'Invalid organizationId query parameter',
        }
      }

      const pagination = {
        currentPage: Number(ctx.query.currentPage) || 1,
        pageSize: Number(ctx.query.pageSize) || 10,
        all: ctx.query.all || 'false',
      }
      const searchQuery = ctx.query.search ? String(ctx.query.search) : ''

      const result = await listHrPolicyConfigs_func({
        reqObject: { user: ctx.user! },
        organizationId,
        pagination,
        searchQuery,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching HR policies',
      }
    }
  }

  static async assignEmployees(ctx: CustomContext) {
    try {
      const result = await assignHrPolicyToEmployees_func({
        reqObject: { user: ctx.user! },
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while assigning policy to employees',
      }
    }
  }

  static async update(ctx: CustomContext) {
    try {
      const id = Number(ctx.params.id)
      if (isNaN(id)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid policy ID' }
      }

      const result = await updateHrPolicyConfig_func({
        reqObject: { user: ctx.user! },
        id,
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while updating HR policy',
      }
    }
  }

  static async delete(ctx: CustomContext) {
    try {
      const id = Number(ctx.params.id)
      if (isNaN(id)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid policy ID' }
      }

      const result = await deleteHrPolicyConfig_func({
        reqObject: { user: ctx.user! },
        id,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while deleting HR policy',
      }
    }
  }
}
