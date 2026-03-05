import { CustomContext } from '../../utils/types'
import { approveHrLeaveRequest_func } from './functions/approveHrLeaveRequest'
import { createHrLeaveRequest_func } from './functions/createHrLeaveRequest'
import { createHrLeaveType_func } from './functions/createHrLeaveType'
import { deleteHrLeaveType_func } from './functions/deleteHrLeaveType'
import { getEmployeeHrLeaveBalances_func } from './functions/getEmployeeHrLeaveBalances'
import { getHrLeaveTypeById_func } from './functions/getHrLeaveTypeById'
import { getHrLeaveTypes_func } from './functions/getHrLeaveTypes'
import { getMyHrLeaveBalances_func } from './functions/getMyHrLeaveBalances'
import { getMyHrLeaveRequests_func } from './functions/getMyHrLeaveRequests'
import { getPendingHrLeaveApprovals_func } from './functions/getPendingHrLeaveApprovals'
import { rejectHrLeaveRequest_func } from './functions/rejectHrLeaveRequest'
import { updateHrLeaveType_func } from './functions/updateHrLeaveType'
import { upsertHrLeaveBalance_func } from './functions/upsertHrLeaveBalance'

export class HrLeaveController {
  static async createLeaveType(ctx: CustomContext) {
    try {
      const result = await createHrLeaveType_func({
        reqObject: { user: ctx.user! },
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 201 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while creating leave type' }
    }
  }

  static async listLeaveTypes(ctx: CustomContext) {
    try {
      const organizationId = ctx.query?.organizationId
        ? Number(ctx.query.organizationId)
        : undefined
      if (ctx.query?.organizationId && isNaN(Number(ctx.query.organizationId))) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid organizationId query parameter' }
      }
      const pagination = {
        currentPage: Number(ctx.query.currentPage) || 1,
        pageSize: Number(ctx.query.pageSize) || 10,
        all: ctx.query.all || 'false',
      }
      const searchQuery = ctx.query.search ? String(ctx.query.search) : ''
      const result = await getHrLeaveTypes_func({
        reqObject: { user: ctx.user! },
        organizationId,
        pagination,
        searchQuery,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while fetching leave types' }
    }
  }

  static async getLeaveTypeById(ctx: CustomContext) {
    try {
      const id = Number(ctx.query.id)
      if (isNaN(id)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid leave type ID' }
      }
      const result = await getHrLeaveTypeById_func({
        reqObject: { user: ctx.user! },
        id,
      })
      ctx.set.status = result?.success ? 200 : 404
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while fetching leave type' }
    }
  }

  static async updateLeaveType(ctx: CustomContext) {
    try {
      const id = Number(ctx.query.id)
      if (isNaN(id)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid leave type ID' }
      }
      const result = await updateHrLeaveType_func({
        reqObject: { user: ctx.user! },
        id,
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while updating leave type' }
    }
  }

  static async deleteLeaveType(ctx: CustomContext) {
    try {
      const id = Number(ctx.query.id)
      if (isNaN(id)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid leave type ID' }
      }
      const result = await deleteHrLeaveType_func({
        reqObject: { user: ctx.user! },
        id,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while deleting leave type' }
    }
  }

  static async submitLeaveRequest(ctx: CustomContext) {
    try {
      const result = await createHrLeaveRequest_func({
        reqObject: { user: ctx.user! },
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 201 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while submitting leave request' }
    }
  }

  static async myLeaveRequests(ctx: CustomContext) {
    try {
      const pagination = {
        currentPage: Number(ctx.query.currentPage) || 1,
        pageSize: Number(ctx.query.pageSize) || 10,
        all: ctx.query.all || 'false',
      }
      const result = await getMyHrLeaveRequests_func({
        reqObject: { user: ctx.user! },
        pagination,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while fetching leave requests' }
    }
  }

  static async pendingApprovals(ctx: CustomContext) {
    try {
      const pagination = {
        currentPage: Number(ctx.query.currentPage) || 1,
        pageSize: Number(ctx.query.pageSize) || 10,
        all: ctx.query.all || 'false',
      }
      const userId = ctx.query?.userId ? Number(ctx.query.userId) : undefined
      if (ctx.query?.userId && isNaN(Number(ctx.query.userId))) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid userId query parameter' }
      }
      const result = await getPendingHrLeaveApprovals_func({
        reqObject: { user: ctx.user! },
        pagination,
        userId,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while fetching pending leave approvals' }
    }
  }

  static async approveLeaveRequest(ctx: CustomContext) {
    try {
      const approvalId = Number(ctx.params.id)
      if (isNaN(approvalId)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid approval ID' }
      }
      const result = await approveHrLeaveRequest_func({
        reqObject: { user: ctx.user! },
        approvalId,
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while approving leave request' }
    }
  }

  static async rejectLeaveRequest(ctx: CustomContext) {
    try {
      const approvalId = Number(ctx.params.id)
      if (isNaN(approvalId)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid approval ID' }
      }
      const result = await rejectHrLeaveRequest_func({
        reqObject: { user: ctx.user! },
        approvalId,
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while rejecting leave request' }
    }
  }

  static async myBalances(ctx: CustomContext) {
    try {
      const year = ctx.query?.year ? Number(ctx.query.year) : undefined
      if (ctx.query?.year && isNaN(Number(ctx.query.year))) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid year query parameter' }
      }
      const result = await getMyHrLeaveBalances_func({
        reqObject: { user: ctx.user! },
        year,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while fetching leave balances' }
    }
  }

  static async employeeBalances(ctx: CustomContext) {
    try {
      const employeeProfileId = Number(ctx.query.employeeProfileId)
      if (isNaN(employeeProfileId)) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid employeeProfileId query parameter' }
      }
      const year = ctx.query?.year ? Number(ctx.query.year) : undefined
      if (ctx.query?.year && isNaN(Number(ctx.query.year))) {
        ctx.set.status = 400
        return { success: false, message: 'Invalid year query parameter' }
      }
      const result = await getEmployeeHrLeaveBalances_func({
        reqObject: { user: ctx.user! },
        employeeProfileId,
        year,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while fetching employee leave balances' }
    }
  }

  static async upsertBalance(ctx: CustomContext) {
    try {
      const result = await upsertHrLeaveBalance_func({
        reqObject: { user: ctx.user! },
        data: ctx.body as any,
      })
      ctx.set.status = result?.success ? 200 : 400
      return result
    } catch {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while upserting leave balance' }
    }
  }
}

