import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrLeaveApprovals } from '../../../models/HrLeaveApproval'
import { hrLeaveBalances } from '../../../models/HrLeaveBalance'
import { hrLeaveRequests } from '../../../models/HrLeaveRequest'
import { hrLeaveTypes } from '../../../models/HrLeaveType'
import { ReqObjectType } from '../../../utils/types'
import { hasSystemRole } from '../../../utils/roleHelpers'
import { diffDaysInclusive, ensureLeaveBalance } from './_helpers'

interface Params {
  reqObject: ReqObjectType
  approvalId: number
  data?: { note?: string | null }
}

export async function approveHrLeaveRequest_func({
  reqObject,
  approvalId,
  data,
}: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    const actorUserId = Number(reqObject.user.id)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const isSystemUser = await hasSystemRole(actorUserId)

    const [approval] = await db
      .select()
      .from(hrLeaveApprovals)
      .where(
        and(
          eq(hrLeaveApprovals.id, Number(approvalId)),
          eq(hrLeaveApprovals.organizationId, orgId),
        ),
      )
      .limit(1)
    if (!approval) return { success: false, message: 'Leave approval request not found' }
    if (approval.status !== 'PENDING') return { success: false, message: 'Leave request is not pending for approval' }
    if (!isSystemUser && Number(approval.approverUserId) !== actorUserId) {
      return { success: false, message: 'You are not authorized to approve this leave request' }
    }

    const [leaveRequest] = await db
      .select()
      .from(hrLeaveRequests)
      .where(
        and(
          eq(hrLeaveRequests.id, Number(approval.leaveRequestId)),
          eq(hrLeaveRequests.organizationId, orgId),
        ),
      )
      .limit(1)
    if (!leaveRequest) return { success: false, message: 'Leave request not found' }
    if (leaveRequest.status !== 'PENDING') return { success: false, message: 'Leave request is no longer pending' }

    const leaveDays = diffDaysInclusive(String(leaveRequest.startDate), String(leaveRequest.endDate))
    const [leaveType] = await db
      .select()
      .from(hrLeaveTypes)
      .where(
        and(
          eq(hrLeaveTypes.id, Number(leaveRequest.leaveTypeId)),
          eq(hrLeaveTypes.organizationId, orgId),
        ),
      )
      .limit(1)
    if (!leaveType) return { success: false, message: 'Leave type not found' }

    const year = new Date(`${leaveRequest.startDate}T00:00:00.000Z`).getUTCFullYear()
    const balance = await ensureLeaveBalance(
      orgId,
      Number(leaveRequest.employeeProfileId),
      Number(leaveRequest.leaveTypeId),
      year,
      leaveType.annualAllocationDays,
    )
    const availableDays = Number(balance.allocatedDays || 0) + Number(balance.carriedOverDays || 0) - Number(balance.usedDays || 0)
    if (availableDays < leaveDays) {
      return {
        success: false,
        message: `Insufficient leave balance at approval time. Available: ${availableDays}, Requested: ${leaveDays}`,
      }
    }

    const txResult = await db.transaction(async (tx) => {
      const [updatedRequest] = await tx
        .update(hrLeaveRequests)
        .set({
          status: 'APPROVED',
          updatedAt: new Date(),
        })
        .where(eq(hrLeaveRequests.id, Number(leaveRequest.id)))
        .returning()

      const [updatedApproval] = await tx
        .update(hrLeaveApprovals)
        .set({
          status: 'APPROVED',
          approverUserId: actorUserId,
          decidedAt: new Date(),
          note: data?.note || approval.note || null,
          updatedAt: new Date(),
        })
        .where(eq(hrLeaveApprovals.id, Number(approval.id)))
        .returning()

      const [updatedBalance] = await tx
        .update(hrLeaveBalances)
        .set({
          usedDays: Number(balance.usedDays || 0) + leaveDays,
          updatedAt: new Date(),
        })
        .where(eq(hrLeaveBalances.id, Number(balance.id)))
        .returning()

      return { request: updatedRequest, approval: updatedApproval, balance: updatedBalance, leaveDays }
    })

    return {
      success: true,
      message: 'Leave request approved successfully',
      data: txResult,
    }
  } catch (error: any) {
    console.error('Error approving leave request:', error)
    return {
      success: false,
      message: 'Failed to approve leave request',
      error: error?.message,
    }
  }
}
