import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrLeaveApprovals } from '../../../models/HrLeaveApproval'
import { hrLeaveRequests } from '../../../models/HrLeaveRequest'
import { ReqObjectType } from '../../../utils/types'
import { hasSystemRole } from '../../../utils/roleHelpers'

interface Params {
  reqObject: ReqObjectType
  approvalId: number
  data: { note?: string | null }
}

export async function rejectHrLeaveRequest_func({
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
      return { success: false, message: 'You are not authorized to reject this leave request' }
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

    const txResult = await db.transaction(async (tx) => {
      const [updatedRequest] = await tx
        .update(hrLeaveRequests)
        .set({
          status: 'REJECTED',
          updatedAt: new Date(),
        })
        .where(eq(hrLeaveRequests.id, Number(leaveRequest.id)))
        .returning()

      const [updatedApproval] = await tx
        .update(hrLeaveApprovals)
        .set({
          status: 'REJECTED',
          approverUserId: actorUserId,
          decidedAt: new Date(),
          note: data?.note || approval.note || null,
          updatedAt: new Date(),
        })
        .where(eq(hrLeaveApprovals.id, Number(approval.id)))
        .returning()

      return { request: updatedRequest, approval: updatedApproval }
    })

    return {
      success: true,
      message: 'Leave request rejected successfully',
      data: txResult,
    }
  } catch (error: any) {
    console.error('Error rejecting leave request:', error)
    return {
      success: false,
      message: 'Failed to reject leave request',
      error: error?.message,
    }
  }
}

