import { db } from '../../../db/connection'
import { hrTimeBreaks } from '../../../models/HrTimeBreak'
import { ReqObjectType } from '../../../utils/types'
import {
  getEmployeeProfileForUser,
  logPunchEvent,
  getOpenBreak,
  getOpenSession,
} from './_helpers'

interface Params {
  reqObject: ReqObjectType
}

export async function startBreak_func({ reqObject }: Params) {
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
        message: 'No active session found. Clock in first.',
      }
    }

    const existingOpenBreak = await getOpenBreak(orgId, openSession.id)
    if (existingOpenBreak) {
      return {
        success: false,
        message: 'A break is already running. End current break first.',
        data: existingOpenBreak,
      }
    }

    const [createdBreak] = await db
      .insert(hrTimeBreaks)
      .values({
        organizationId: orgId,
        timeSessionId: openSession.id,
        breakStartAt: new Date(),
        status: 'OPEN',
        durationMinutes: 0,
        complianceStatus: 'PENDING',
      })
      .returning()

    await logPunchEvent({
      organizationId: orgId,
      timeSessionId: openSession.id,
      employeeProfileId: profile.id,
      userId: Number(reqObject.user.id),
      eventType: 'BREAK_OUT',
      eventAt: new Date(createdBreak.breakStartAt as any),
    })

    return {
      success: true,
      message: 'Break started successfully',
      data: createdBreak,
    }
  } catch (error: any) {
    console.error('Error starting break:', error)
    return {
      success: false,
      message: 'Failed to start break',
      error: error?.message,
    }
  }
}
