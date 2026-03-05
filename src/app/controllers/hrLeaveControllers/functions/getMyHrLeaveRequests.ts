import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrLeaveApprovals } from '../../../models/HrLeaveApproval'
import { hrLeaveRequests } from '../../../models/HrLeaveRequest'
import { hrLeaveTypes } from '../../../models/HrLeaveType'
import { IPagination, ReqObjectType } from '../../../utils/types'
import { getEmployeeProfileByUserId } from './_helpers'

interface Params {
  reqObject: ReqObjectType
  pagination?: IPagination
}

export async function getMyHrLeaveRequests_func({ reqObject, pagination }: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    const userId = Number(reqObject.user.id)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const employeeProfile = await getEmployeeProfileByUserId(orgId, userId)
    if (!employeeProfile) {
      return { success: false, message: 'HR employee profile not found for user' }
    }

    const filter = and(
      eq(hrLeaveRequests.organizationId, orgId),
      eq(hrLeaveRequests.employeeProfileId, Number(employeeProfile.id)),
    )

    const all = pagination?.all === 'true' || pagination?.all === '1'
    if (all) {
      const rows = await db
        .select({
          request: hrLeaveRequests,
          leaveType: {
            id: hrLeaveTypes.id,
            code: hrLeaveTypes.code,
            displayName: hrLeaveTypes.displayName,
          },
          approval: {
            id: hrLeaveApprovals.id,
            approverUserId: hrLeaveApprovals.approverUserId,
            status: hrLeaveApprovals.status,
            decidedAt: hrLeaveApprovals.decidedAt,
            note: hrLeaveApprovals.note,
          },
        })
        .from(hrLeaveRequests)
        .leftJoin(hrLeaveTypes, eq(hrLeaveTypes.id, hrLeaveRequests.leaveTypeId))
        .leftJoin(hrLeaveApprovals, eq(hrLeaveApprovals.leaveRequestId, hrLeaveRequests.id))
        .where(filter)
        .orderBy(desc(hrLeaveRequests.id))

      return {
        success: true,
        message: rows.length > 0 ? 'Leave requests fetched successfully' : 'No leave requests found',
        data: rows,
        pagination: { total: rows.length, page: 1, pageSize: rows.length },
      }
    }

    const page = pagination?.currentPage || 1
    const pageSize = pagination?.pageSize || 10
    const offset = (page - 1) * pageSize

    const rows = await db
      .select({
        request: hrLeaveRequests,
        leaveType: {
          id: hrLeaveTypes.id,
          code: hrLeaveTypes.code,
          displayName: hrLeaveTypes.displayName,
        },
        approval: {
          id: hrLeaveApprovals.id,
          approverUserId: hrLeaveApprovals.approverUserId,
          status: hrLeaveApprovals.status,
          decidedAt: hrLeaveApprovals.decidedAt,
          note: hrLeaveApprovals.note,
        },
      })
      .from(hrLeaveRequests)
      .leftJoin(hrLeaveTypes, eq(hrLeaveTypes.id, hrLeaveRequests.leaveTypeId))
      .leftJoin(hrLeaveApprovals, eq(hrLeaveApprovals.leaveRequestId, hrLeaveRequests.id))
      .where(filter)
      .orderBy(desc(hrLeaveRequests.id))
      .limit(pageSize)
      .offset(offset)

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrLeaveRequests)
      .where(filter)

    return {
      success: true,
      message: rows.length > 0 ? 'Leave requests fetched successfully' : 'No leave requests found',
      data: rows,
      pagination: { total: Number(totalRow?.total || 0), page, pageSize },
    }
  } catch (error: any) {
    console.error('Error fetching my leave requests:', error)
    return {
      success: false,
      message: 'Failed to fetch leave requests',
      error: error?.message,
    }
  }
}

