import { ReqObjectType } from '../../../utils/types'
import { endBreak_func } from './endBreak'
import {
  getEmployeeProfileForUser,
  getOpenBreak,
  getOpenSession,
} from './_helpers'
import { startBreak_func } from './startBreak'

interface Params {
  reqObject: ReqObjectType
}

export async function punchBreak_func({ reqObject }: Params) {
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
      action: 'CLOCK_IN_REQUIRED',
    }
  }

  const openBreak = await getOpenBreak(orgId, openSession.id)
  if (openBreak) {
    const result = await endBreak_func({ reqObject })
    return { ...result, action: 'BREAK_IN' }
  }

  const result = await startBreak_func({ reqObject })
  return { ...result, action: 'BREAK_OUT' }
}
