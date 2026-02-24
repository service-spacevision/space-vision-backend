import { CustomContext } from '../../utils/types'
import { assignHrEmployeeProfile_func } from './functions/assignHrEmployeeProfile'
import { getHrEmployeeProfiles_func } from './functions/getHrEmployeeProfiles'
import { getHrEmployeeProfileById_func } from './functions/getHrEmployeeProfileById'
import { updateHrEmployeeProfile_func } from './functions/updateHrEmployeeProfile'

export class HrEmployeeProfileController {
  static async assign(ctx: CustomContext) {
    try {
      const result = await assignHrEmployeeProfile_func({
        reqObject: { user: ctx.user! },
        data: ctx.body as any,
      })

      ctx.set.status = result?.success ? 201 : 400
      return result
    } catch (err) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while assigning employee profile',
      }
    }
  }

  static async list(ctx: CustomContext) {
    try {
      const pagination = {
        currentPage: Number(ctx.query.currentPage) || 1,
        pageSize: Number(ctx.query.pageSize) || 10,
        all: ctx.query.all || 'false',
      }
      const searchQuery = ctx.query.search ? String(ctx.query.search) : ''

      const result = await getHrEmployeeProfiles_func({
        reqObject: { user: ctx.user! },
        pagination,
        searchQuery,
      })

      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch (err) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching employee profiles',
      }
    }
  }

  static async getById(ctx: CustomContext) {
    try {
      const id = Number(ctx.params.id)
      if (isNaN(id)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid employee profile ID' }
      }

      const result = await getHrEmployeeProfileById_func({
        reqObject: { user: ctx.user! },
        id,
      })

      ctx.set.status = result?.success ? 200 : 404
      return result
    } catch (err) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching employee profile',
      }
    }
  }

  static async update(ctx: CustomContext) {
    try {
      const id = Number(ctx.params.id)
      if (isNaN(id)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid employee profile ID' }
      }

      const result = await updateHrEmployeeProfile_func({
        reqObject: { user: ctx.user! },
        id,
        data: ctx.body as any,
      })

      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch (err) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while updating employee profile',
      }
    }
  }
}
