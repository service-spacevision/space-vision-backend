import { db } from '../../../db/connection'
import { hrTimeSessions } from '../../../models/HrTimeSession'
import { ReqObjectType } from '../../../utils/types'
import { getEmployeeProfileForUser, getOpenSession, logPunchEvent } from './_helpers'

interface Params {
  reqObject: ReqObjectType
}

export async function clockIn_func({ reqObject }: Params) {
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

    const existingOpenSession = await getOpenSession(orgId, profile.id)
    if (existingOpenSession) {
      return {
        success: false,
        message: 'Active time session already exists. Clock out first.',
        data: existingOpenSession,
      }
    }

    const [session] = await db
      .insert(hrTimeSessions)
      .values({
        organizationId: orgId,
        employeeProfileId: profile.id,
        clockInAt: new Date(),
        status: 'OPEN',
      })
      .returning()

    await logPunchEvent({
      organizationId: orgId,
      timeSessionId: session.id,
      employeeProfileId: profile.id,
      userId: Number(reqObject.user.id),
      eventType: 'CLOCK_IN',
      eventAt: new Date(session.clockInAt as any),
    })

    return {
      success: true,
      message: 'Clock in successful',
      data: session,
    }
  } catch (error: any) {
    console.error('Error clocking in:', error)
    return {
      success: false,
      message: 'Failed to clock in',
      error: error?.message,
    }
  }
}
