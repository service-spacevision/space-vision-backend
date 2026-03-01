import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrTimeSessionApprovals } from '../../../models/HrTimeSessionApproval'
import { hrTimeSessions } from '../../../models/HrTimeSession'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  approvalId: number
  data?: {
    note?: string | null
  }
}

export async function rejectClockOut_func({
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
      return { success: false, message: 'You are not allowed to reject this entry' }
    }

    if (approval.status !== 'PENDING') {
      return { success: false, message: `Approval already decided as ${approval.status}` }
    }

    if (!data?.note || !data.note.trim()) {
      return { success: false, message: 'Rejection note is required' }
    }

    const [updatedSession] = await db
      .update(hrTimeSessions)
      .set({
        status: 'REJECTED',
        updatedAt: new Date(),
      })
      .where(eq(hrTimeSessions.id, approval.timeSessionId))
      .returning()

    const [updatedApproval] = await db
      .update(hrTimeSessionApprovals)
      .set({
        status: 'REJECTED',
        decidedAt: new Date(),
        note: data.note,
        updatedAt: new Date(),
      })
      .where(eq(hrTimeSessionApprovals.id, approval.id))
      .returning()

    return {
      success: true,
      message: 'Clock-out rejected successfully',
      data: {
        approval: updatedApproval,
        session: updatedSession,
      },
    }
  } catch (error: any) {
    console.error('Error rejecting clock-out:', error)
    return {
      success: false,
      message: 'Failed to reject clock-out',
      error: error?.message,
    }
  }
}
