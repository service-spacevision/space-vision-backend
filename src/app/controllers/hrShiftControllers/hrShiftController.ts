import { CustomContext } from '../../utils/types'
import { addHrShiftGroupMembers_func } from './functions/addHrShiftGroupMembers'
import { applyHrShiftLayout_func } from './functions/applyHrShiftLayout'
import { createHrShiftGroup_func } from './functions/createHrShiftGroup'
import { createHrShiftLayout_func } from './functions/createHrShiftLayout'
import { createManualHrShift_func } from './functions/createManualHrShift'
import { deleteHrShift_func } from './functions/deleteHrShift'
import { getHrShifts_func } from './functions/getHrShifts'
import { getHrShiftTimezones_func } from './functions/getHrShiftTimezones'
import { updateHrShift_func } from './functions/updateHrShift'

export class HrShiftController {
  static async listTimezones(ctx: CustomContext) {
    try {
      const result = await getHrShiftTimezones_func()
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while fetching timezone list' }
    }
  }

  static async createGroup(ctx: CustomContext) {
    try {
      const result = await createHrShiftGroup_func({
        reqObject: { user: ctx.user! },
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 201 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while creating shift group' }
    }
  }

  static async addGroupMembers(ctx: CustomContext) {
    try {
      const result = await addHrShiftGroupMembers_func({
        reqObject: { user: ctx.user! },
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while updating shift group members' }
    }
  }

  static async createLayout(ctx: CustomContext) {
    try {
      const result = await createHrShiftLayout_func({
        reqObject: { user: ctx.user! },
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 201 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while creating shift layout' }
    }
  }

  static async applyLayout(ctx: CustomContext) {
    try {
      const result = await applyHrShiftLayout_func({
        reqObject: { user: ctx.user! },
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while applying shift layout' }
    }
  }

  static async createManual(ctx: CustomContext) {
    try {
      const result = await createManualHrShift_func({
        reqObject: { user: ctx.user! },
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 201 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while creating manual shift' }
    }
  }

  static async list(ctx: CustomContext) {
    try {
      const result = await getHrShifts_func({
        reqObject: { user: ctx.user! },
        pagination: {
          currentPage: Number(ctx.query.currentPage) || 1,
          pageSize: Number(ctx.query.pageSize) || 10,
          all: ctx.query.all || 'false',
        },
        filters: {
          employeeProfileId: ctx.query.employeeProfileId ? Number(ctx.query.employeeProfileId) : undefined,
          shiftGroupId: ctx.query.shiftGroupId ? Number(ctx.query.shiftGroupId) : undefined,
          startDate: ctx.query.startDate ? String(ctx.query.startDate) : undefined,
          endDate: ctx.query.endDate ? String(ctx.query.endDate) : undefined,
        },
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while fetching shifts' }
    }
  }

  static async update(ctx: CustomContext) {
    try {
      const id = Number(ctx.query.id)
      if (isNaN(id)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid shift ID' }
      }

      const result = await updateHrShift_func({
        reqObject: { user: ctx.user! },
        id,
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while updating shift' }
    }
  }

  static async delete(ctx: CustomContext) {
    try {
      const id = Number(ctx.query.id)
      if (isNaN(id)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid shift ID' }
      }

      const result = await deleteHrShift_func({
        reqObject: { user: ctx.user! },
        id,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while deleting shift' }
    }
  }
}
