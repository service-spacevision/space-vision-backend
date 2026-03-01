import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrTimeBreaks } from '../../../models/HrTimeBreak'
import { hrTimeBreakApprovals } from '../../../models/HrTimeBreakApproval'
import { ReqObjectType } from '../../../utils/types'
import {
  getAllowedBreakMinutes,
  getBreakApproval,
  getBreakMinutesBySession,
  getEmployeeProfileForUser,
  logPunchEvent,
  getOpenBreak,
  getOpenSession,
} from './_helpers'

interface Params {
  reqObject: ReqObjectType
}

export async function endBreak_func({ reqObject }: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const profile = await getEmployeeProfileForUser(reqObject)
    if (!profile) {
      return {
        success: false,
        message: 'Employee profile not found. Assign employee profile first.',
      }
    }

    const openSession = await getOpenSession(orgId, profile.id)
    if (!openSession) {
      return {
        success: false,
        message: 'No active session found.',
      }
    }

    const openBreak = await getOpenBreak(orgId, openSession.id)
    if (!openBreak) {
      return {
        success: false,
        message: 'No active break found.',
      }
    }

    const breakEndAt = new Date()
    const breakStartAt = new Date(openBreak.breakStartAt as any)
    const currentBreakMinutes = Math.max(
      0,
      Math.round((breakEndAt.getTime() - breakStartAt.getTime()) / 60000),
    )

    const usedBreakMinutes = await getBreakMinutesBySession(openSession.id)
    const allowedBreakMinutes = await getAllowedBreakMinutes(orgId)
    const cumulativeBreakMinutes = usedBreakMinutes + currentBreakMinutes
    const complianceStatus =
      cumulativeBreakMinutes > allowedBreakMinutes ? 'LATE' : 'ON_TIME'

    const [updatedBreak] = await db
      .update(hrTimeBreaks)
      .set({
        breakEndAt,
        durationMinutes: currentBreakMinutes,
        complianceStatus,
        status: 'CLOSED',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(hrTimeBreaks.id, openBreak.id),
          eq(hrTimeBreaks.organizationId, orgId),
        ),
      )
      .returning()

    await logPunchEvent({
      organizationId: orgId,
      timeSessionId: openSession.id,
      employeeProfileId: profile.id,
      userId: Number(reqObject.user.id),
      eventType: 'BREAK_IN',
      eventAt: breakEndAt,
    })

    let breakApproval: any = null
    if (complianceStatus === 'LATE') {
      const approverUserId = Number(
        profile.reportsToUserId || reqObject.user.id,
      )
      const existingBreakApproval = await getBreakApproval(updatedBreak.id)
      const approvalPayload = {
        organizationId: orgId,
        timeBreakId: updatedBreak.id,
        requestedByUserId: Number(reqObject.user.id),
        approverUserId,
        status: 'PENDING',
        requestedAt: new Date(),
        decidedAt: null,
        note: null as string | null,
        updatedAt: new Date(),
      }

      if (existingBreakApproval) {
        const [updatedApproval] = await db
          .update(hrTimeBreakApprovals)
          .set(approvalPayload)
          .where(eq(hrTimeBreakApprovals.id, existingBreakApproval.id))
          .returning()
        breakApproval = updatedApproval
      } else {
        const [createdApproval] = await db
          .insert(hrTimeBreakApprovals)
          .values(approvalPayload)
          .returning()
        breakApproval = createdApproval
      }
    }

    return {
      success: true,
      message: 'Break ended successfully',
      data: {
        ...updatedBreak,
        approval: breakApproval,
        allowedBreakMinutes,
        cumulativeBreakMinutes,
      },
    }
  } catch (error: any) {
    console.error('Error ending break:', error)
    return {
      success: false,
      message: 'Failed to end break',
      error: error?.message,
    }
  }
}
