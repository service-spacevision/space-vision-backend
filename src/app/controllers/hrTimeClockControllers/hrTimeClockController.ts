import { CustomContext } from '../../utils/types'
import { clockIn_func } from './functions/clockIn'
import { clockOut_func } from './functions/clockOut'
import { endBreak_func } from './functions/endBreak'
import { approveClockOut_func } from './functions/approveClockOut'
import { approveBreakCompliance_func } from './functions/approveBreakCompliance'
import { getMyTimeClockAudit_func } from './functions/getMyTimeClockAudit'
import { getPendingBreakApprovals_func } from './functions/getPendingBreakApprovals'
import { getPendingClockOutApprovals_func } from './functions/getPendingClockOutApprovals'
import { getTimeClockStatus_func } from './functions/getTimeClockStatus'
import { punch_func } from './functions/punch'
import { punchBreak_func } from './functions/punchBreak'
import { rejectBreakCompliance_func } from './functions/rejectBreakCompliance'
import { rejectClockOut_func } from './functions/rejectClockOut'
import { startBreak_func } from './functions/startBreak'

export class HrTimeClockController {
  static async status(ctx: CustomContext) {
    try {
      const result = await getTimeClockStatus_func({
        reqObject: { user: ctx.user! },
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching time clock status',
      }
    }
  }

  static async punch(ctx: CustomContext) {
    try {
      const rawEndDay = (ctx.body as any)?.endDay
      const endDay =
        rawEndDay === true ||
        rawEndDay === 'true' ||
        rawEndDay === 1 ||
        rawEndDay === '1'
      const result = await punch_func({
        reqObject: { user: ctx.user! },
        endDay,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while processing punch action',
      }
    }
  }

  static async clockIn(ctx: CustomContext) {
    try {
      const result = await clockIn_func({
        reqObject: { user: ctx.user! },
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while clocking in',
      }
    }
  }

  static async punchBreak(ctx: CustomContext) {
    try {
      const result = await punchBreak_func({
        reqObject: { user: ctx.user! },
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while processing break action',
      }
    }
  }

  static async startBreak(ctx: CustomContext) {
    try {
      const result = await startBreak_func({
        reqObject: { user: ctx.user! },
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while starting break',
      }
    }
  }

  static async endBreak(ctx: CustomContext) {
    try {
      const result = await endBreak_func({
        reqObject: { user: ctx.user! },
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while ending break',
      }
    }
  }

  static async clockOut(ctx: CustomContext) {
    try {
      const result = await clockOut_func({
        reqObject: { user: ctx.user! },
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while clocking out',
      }
    }
  }

  static async myAudit(ctx: CustomContext) {
    try {
      const date = ctx.query?.date ? String(ctx.query.date) : undefined
      const result = await getMyTimeClockAudit_func({
        reqObject: { user: ctx.user! },
        date,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching time clock audit',
      }
    }
  }

  static async pendingApprovals(ctx: CustomContext) {
    try {
      const userId = ctx.query?.userId ? Number(ctx.query.userId) : undefined
      if (ctx.query?.userId && (userId === undefined || isNaN(userId))) {
        ctx.set.status = 400
        return {
          success: false,
          message: 'Invalid userId query parameter',
        }
      }

      const result = await getPendingClockOutApprovals_func({
        reqObject: { user: ctx.user! },
        userId,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching pending approvals',
      }
    }
  }

  static async pendingBreakApprovals(ctx: CustomContext) {
    try {
      const result = await getPendingBreakApprovals_func({
        reqObject: { user: ctx.user! },
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching pending break approvals',
      }
    }
  }

  static async approveClockOut(ctx: CustomContext) {
    try {
      const approvalId = Number(ctx.params.id)
      if (isNaN(approvalId)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid approval ID' }
      }

      const result = await approveClockOut_func({
        reqObject: { user: ctx.user! },
        approvalId,
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while approving clock-out',
      }
    }
  }

  static async rejectClockOut(ctx: CustomContext) {
    try {
      const approvalId = Number(ctx.params.id)
      if (isNaN(approvalId)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid approval ID' }
      }

      const result = await rejectClockOut_func({
        reqObject: { user: ctx.user! },
        approvalId,
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while rejecting clock-out',
      }
    }
  }

  static async approveBreakCompliance(ctx: CustomContext) {
    try {
      const approvalId = Number(ctx.params.id)
      if (isNaN(approvalId)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid approval ID' }
      }

      const result = await approveBreakCompliance_func({
        reqObject: { user: ctx.user! },
        approvalId,
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while approving break compliance',
      }
    }
  }

  static async rejectBreakCompliance(ctx: CustomContext) {
    try {
      const approvalId = Number(ctx.params.id)
      if (isNaN(approvalId)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid approval ID' }
      }

      const result = await rejectBreakCompliance_func({
        reqObject: { user: ctx.user! },
        approvalId,
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while rejecting break compliance',
      }
    }
  }
}
