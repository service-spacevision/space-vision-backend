import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrTimeBreakApprovals } from '../../../models/HrTimeBreakApproval'
import { hrTimeBreaks } from '../../../models/HrTimeBreak'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  approvalId: number
  data?: {
    note?: string | null
  }
}

export async function rejectBreakCompliance_func({
  reqObject,
  approvalId,
  data,
}: Params) {
  try {
    const approverUserId = Number(reqObject.user.id)
    const organizationId = Number(reqObject.user.organizationId)

    const [approval] = await db
      .select()
      .from(hrTimeBreakApprovals)
      .where(
        and(
          eq(hrTimeBreakApprovals.id, approvalId),
          eq(hrTimeBreakApprovals.organizationId, organizationId),
        ),
      )
      .limit(1)

    if (!approval) return { success: false, message: 'Break approval request not found' }
    if (Number(approval.approverUserId) !== approverUserId) {
      return { success: false, message: 'You are not allowed to reject this entry' }
    }
    if (approval.status !== 'PENDING') {
      return { success: false, message: `Approval already decided as ${approval.status}` }
    }
    if (!data?.note || !data.note.trim()) {
      return { success: false, message: 'Rejection note is required' }
    }

    const [updatedBreak] = await db
      .update(hrTimeBreaks)
      .set({
        // Keep original compliance classification (LATE/ON_TIME) immutable.
        updatedAt: new Date(),
      })
      .where(eq(hrTimeBreaks.id, approval.timeBreakId))
      .returning()

    const [updatedApproval] = await db
      .update(hrTimeBreakApprovals)
      .set({
        status: 'REJECTED',
        decidedAt: new Date(),
        note: data.note,
        updatedAt: new Date(),
      })
      .where(eq(hrTimeBreakApprovals.id, approval.id))
      .returning()

    return {
      success: true,
      message: 'Break compliance rejected successfully',
      data: {
        approval: updatedApproval,
        timeBreak: updatedBreak,
      },
    }
  } catch (error: any) {
    console.error('Error rejecting break compliance:', error)
    return {
      success: false,
      message: 'Failed to reject break compliance',
      error: error?.message,
    }
  }
}
