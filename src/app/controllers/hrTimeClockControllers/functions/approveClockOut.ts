import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrTimeSessionApprovals } from '../../../models/HrTimeSessionApproval'
import { hrTimeSessions } from '../../../models/HrTimeSession'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  approvalId: number
  data?: {
    adjustedClockOutAt?: string | null
    note?: string | null
  }
}

export async function approveClockOut_func({
  reqObject,
  approvalId,
  data,
}: Params) {
  try {
    const approverUserId = Number(reqObject.user.id)
    const organizationId = Number(reqObject.user.organizationId)

    const [approval] = await db
      .select()
      .from(hrTimeSessionApprovals)
      .where(
        and(
          eq(hrTimeSessionApprovals.id, approvalId),
          eq(hrTimeSessionApprovals.organizationId, organizationId),
        ),
      )
      .limit(1)

    if (!approval) {
      return { success: false, message: 'Approval request not found' }
    }

    if (Number(approval.approverUserId) !== approverUserId) {
      return { success: false, message: 'You are not allowed to approve this entry' }
    }

    if (approval.status !== 'PENDING') {
      return { success: false, message: `Approval already decided as ${approval.status}` }
    }

    let adjustedClockOutAt: Date | null = null
    if (data?.adjustedClockOutAt) {
      adjustedClockOutAt = new Date(data.adjustedClockOutAt)
      if (isNaN(adjustedClockOutAt.getTime())) {
        return { success: false, message: 'Invalid adjustedClockOutAt datetime' }
      }
    }

    const [updatedSession] = await db
      .update(hrTimeSessions)
      .set({
        ...(adjustedClockOutAt ? { clockOutAt: adjustedClockOutAt } : {}),
        status: 'APPROVED',
        updatedAt: new Date(),
      })
      .where(eq(hrTimeSessions.id, approval.timeSessionId))
      .returning()

    const [updatedApproval] = await db
      .update(hrTimeSessionApprovals)
      .set({
        status: 'APPROVED',
        decidedAt: new Date(),
        note: data?.note || null,
        updatedAt: new Date(),
      })
      .where(eq(hrTimeSessionApprovals.id, approval.id))
      .returning()

    return {
      success: true,
      message: 'Clock-out approved successfully',
      data: {
        approval: updatedApproval,
        session: updatedSession,
      },
    }
  } catch (error: any) {
    console.error('Error approving clock-out:', error)
    return {
      success: false,
      message: 'Failed to approve clock-out',
      error: error?.message,
    }
  }
}
