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

export async function approveBreakCompliance_func({
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
      return { success: false, message: 'You are not allowed to approve this entry' }
    }
    if (approval.status !== 'PENDING') {
      return { success: false, message: `Approval already decided as ${approval.status}` }
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
        status: 'APPROVED',
        decidedAt: new Date(),
        note: data?.note || null,
        updatedAt: new Date(),
      })
      .where(eq(hrTimeBreakApprovals.id, approval.id))
      .returning()

    return {
      success: true,
      message: 'Break compliance approved successfully',
      data: {
        approval: updatedApproval,
        timeBreak: updatedBreak,
      },
    }
  } catch (error: any) {
    console.error('Error approving break compliance:', error)
    return {
      success: false,
      message: 'Failed to approve break compliance',
      error: error?.message,
    }
  }
}
