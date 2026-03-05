import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrEmployeeProfiles } from '../../../models/HrEmployeeProfile'
import { hrLeaveApprovals } from '../../../models/HrLeaveApproval'
import { hrLeaveRequests } from '../../../models/HrLeaveRequest'
import { hrLeaveTypes } from '../../../models/HrLeaveType'
import { users } from '../../../models/User'
import { IPagination, ReqObjectType } from '../../../utils/types'
import { hasSystemRole } from '../../../utils/roleHelpers'

interface Params {
  reqObject: ReqObjectType
  pagination?: IPagination
  userId?: number
}

export async function getPendingHrLeaveApprovals_func({
  reqObject,
  pagination,
  userId,
}: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    const approverUserId = Number(reqObject.user.id)
    if (!orgId) return { success: false, message: 'Organization not found for user' }
    const isSystemUser = await hasSystemRole(approverUserId)

    let targetEmployeeProfileId: number | undefined = undefined
    if (userId) {
      const [targetProfile] = await db
        .select({ id: hrEmployeeProfiles.id })
        .from(hrEmployeeProfiles)
        .where(
          and(
            eq(hrEmployeeProfiles.organizationId, orgId),
            eq(hrEmployeeProfiles.userId, Number(userId)),
          ),
        )
        .limit(1)
      if (!targetProfile) {
        return { success: false, message: 'Employee profile not found for provided userId' }
      }
      targetEmployeeProfileId = Number(targetProfile.id)
    }

    const baseFilter = and(
      eq(hrLeaveApprovals.organizationId, orgId),
      ...(isSystemUser ? [] : [eq(hrLeaveApprovals.approverUserId, approverUserId)]),
      eq(hrLeaveApprovals.status, 'PENDING'),
      ...(targetEmployeeProfileId
        ? [eq(hrLeaveRequests.employeeProfileId, targetEmployeeProfileId)]
        : []),
    )

    const all = pagination?.all === 'true' || pagination?.all === '1'
    if (all) {
      const rows = await db
        .select({
          approval: hrLeaveApprovals,
          request: hrLeaveRequests,
          leaveType: {
            id: hrLeaveTypes.id,
            code: hrLeaveTypes.code,
            displayName: hrLeaveTypes.displayName,
          },
          employee: {
            profileId: hrEmployeeProfiles.id,
            userId: users.id,
            fullName: users.fullName,
            email: users.email,
            employeeCode: hrEmployeeProfiles.employeeCode,
          },
        })
        .from(hrLeaveApprovals)
        .innerJoin(hrLeaveRequests, eq(hrLeaveRequests.id, hrLeaveApprovals.leaveRequestId))
        .leftJoin(hrLeaveTypes, eq(hrLeaveTypes.id, hrLeaveRequests.leaveTypeId))
        .leftJoin(hrEmployeeProfiles, eq(hrEmployeeProfiles.id, hrLeaveRequests.employeeProfileId))
        .leftJoin(users, eq(users.id, hrEmployeeProfiles.userId))
        .where(baseFilter)
        .orderBy(desc(hrLeaveApprovals.id))

      return {
        success: true,
        message: rows.length > 0 ? 'Pending leave approvals fetched successfully' : 'No pending leave approvals found',
        data: rows,
        pagination: { total: rows.length, page: 1, pageSize: rows.length },
      }
    }

    const page = pagination?.currentPage || 1
    const pageSize = pagination?.pageSize || 10
    const offset = (page - 1) * pageSize

    const rows = await db
      .select({
        approval: hrLeaveApprovals,
        request: hrLeaveRequests,
        leaveType: {
          id: hrLeaveTypes.id,
          code: hrLeaveTypes.code,
          displayName: hrLeaveTypes.displayName,
        },
        employee: {
          profileId: hrEmployeeProfiles.id,
          userId: users.id,
          fullName: users.fullName,
          email: users.email,
          employeeCode: hrEmployeeProfiles.employeeCode,
        },
      })
      .from(hrLeaveApprovals)
      .innerJoin(hrLeaveRequests, eq(hrLeaveRequests.id, hrLeaveApprovals.leaveRequestId))
      .leftJoin(hrLeaveTypes, eq(hrLeaveTypes.id, hrLeaveRequests.leaveTypeId))
      .leftJoin(hrEmployeeProfiles, eq(hrEmployeeProfiles.id, hrLeaveRequests.employeeProfileId))
      .leftJoin(users, eq(users.id, hrEmployeeProfiles.userId))
      .where(baseFilter)
      .orderBy(desc(hrLeaveApprovals.id))
      .limit(pageSize)
      .offset(offset)

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrLeaveApprovals)
      .innerJoin(hrLeaveRequests, eq(hrLeaveRequests.id, hrLeaveApprovals.leaveRequestId))
      .where(baseFilter)

    return {
      success: true,
      message: rows.length > 0 ? 'Pending leave approvals fetched successfully' : 'No pending leave approvals found',
      data: rows,
      pagination: { total: Number(totalRow?.total || 0), page, pageSize },
    }
  } catch (error: any) {
    console.error('Error fetching pending leave approvals:', error)
    return {
      success: false,
      message: 'Failed to fetch pending leave approvals',
      error: error?.message,
    }
  }
}
