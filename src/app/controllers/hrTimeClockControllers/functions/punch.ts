import { ReqObjectType } from '../../../utils/types'
import { clockIn_func } from './clockIn'
import { clockOut_func } from './clockOut'
import { endBreak_func } from './endBreak'
import {
  getCompletedBreakCount,
  getEmployeeProfileForUser,
  getOpenBreak,
  getOpenSession,
} from './_helpers'
import { startBreak_func } from './startBreak'

interface Params {
  reqObject: ReqObjectType
  endDay?: boolean
}

export async function punch_func({ reqObject, endDay }: Params) {
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
    const result = await clockIn_func({ reqObject })
    return { ...result, action: 'CLOCK_IN' }
  }

  const openBreak = await getOpenBreak(orgId, openSession.id)
  if (openBreak) {
    const result = await endBreak_func({ reqObject })
    return { ...result, action: 'BREAK_END' }
  }

  const completedBreakCount = await getCompletedBreakCount(openSession.id)

  // One-button flow without device rule:
  // CLOCK_IN -> BREAK_START -> BREAK_END -> CLOCK_OUT
  if (completedBreakCount > 0) {
    const result = await clockOut_func({ reqObject })
    return { ...result, action: 'CLOCK_OUT' }
  }

  if (endDay) {
    const result = await clockOut_func({ reqObject })
    return { ...result, action: 'CLOCK_OUT' }
  }

  const result = await startBreak_func({ reqObject })
  return { ...result, action: 'BREAK_START' }
}
