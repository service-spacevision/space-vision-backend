import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrTimeSessions } from '../../../models/HrTimeSession'
import { hrTimeSessionApprovals } from '../../../models/HrTimeSessionApproval'
import { ReqObjectType } from '../../../utils/types'
import {
  getBreakMinutesBySession,
  getEmployeeProfileForUser,
  getSessionApproval,
  logPunchEvent,
  getOpenBreak,
  getOpenSession,
} from './_helpers'

interface Params {
  reqObject: ReqObjectType
}

export async function clockOut_func({ reqObject }: Params) {
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
    if (openBreak) {
      return {
        success: false,
        message: 'You are currently on a break. End break before clock out.',
      }
    }

    const clockOutAt = new Date()
    const [updatedSession] = await db
      .update(hrTimeSessions)
      .set({
        clockOutAt,
        status: 'CLOSED',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(hrTimeSessions.id, openSession.id),
          eq(hrTimeSessions.organizationId, orgId),
        ),
      )
      .returning()

    await logPunchEvent({
      organizationId: orgId,
      timeSessionId: openSession.id,
      employeeProfileId: profile.id,
      userId: Number(reqObject.user.id),
      eventType: 'CLOCK_OUT',
      eventAt: clockOutAt,
    })

    const approverUserId = Number(
      profile.reportsToUserId || reqObject.user.id,
    )
    const existingApproval = await getSessionApproval(openSession.id)
    const approvalPayload = {
      organizationId: orgId,
      timeSessionId: openSession.id,
      requestedByUserId: Number(reqObject.user.id),
      approverUserId,
      status: 'PENDING',
      requestedAt: new Date(),
      decidedAt: null,
      note: null as string | null,
      updatedAt: new Date(),
    }

    let approvalRecord: any
    if (existingApproval) {
      const [updatedApproval] = await db
        .update(hrTimeSessionApprovals)
        .set(approvalPayload)
        .where(eq(hrTimeSessionApprovals.id, existingApproval.id))
        .returning()
      approvalRecord = updatedApproval
    } else {
      const [createdApproval] = await db
        .insert(hrTimeSessionApprovals)
        .values(approvalPayload)
        .returning()
      approvalRecord = createdApproval
    }

    const totalBreakMinutes = await getBreakMinutesBySession(openSession.id)
    const workMinutes = Math.max(
      0,
      Math.round(
        (clockOutAt.getTime() - new Date(openSession.clockInAt as any).getTime()) /
          60000,
      ) - totalBreakMinutes,
    )

    return {
      success: true,
      message: 'Clock out successful',
      data: {
        ...updatedSession,
        approval: approvalRecord,
        totalBreakMinutes,
        workMinutes,
      },
    }
  } catch (error: any) {
    console.error('Error clocking out:', error)
    return {
      success: false,
      message: 'Failed to clock out',
      error: error?.message,
    }
  }
}
