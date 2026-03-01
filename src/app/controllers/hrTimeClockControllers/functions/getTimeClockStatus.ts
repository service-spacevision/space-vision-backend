import { ReqObjectType } from '../../../utils/types'
import {
  getAllowedBreakMinutes,
  getBreakMinutesBySession,
  getCompletedBreakCount,
  getEmployeeProfileForUser,
  getOpenBreak,
  getOpenSession,
} from './_helpers'

interface Params {
  reqObject: ReqObjectType
}

export async function getTimeClockStatus_func({ reqObject }: Params) {
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
    const allowedBreakMinutes = await getAllowedBreakMinutes(orgId)

    if (!openSession) {
      return {
        success: true,
        message: 'Time clock status fetched successfully',
        data: {
          state: 'CLOCKED_OUT',
          nextPunchAction: 'CLOCK_IN',
          employeeProfileId: profile.id,
          openSession: null,
          openBreak: null,
          totalBreakMinutes: 0,
          allowedBreakMinutes,
          breakUsageStatus: 'ON_TIME',
        },
      }
    }

    const openBreak = await getOpenBreak(orgId, openSession.id)
    const totalBreakMinutes = await getBreakMinutesBySession(openSession.id)
    const completedBreakCount = await getCompletedBreakCount(openSession.id)

    return {
      success: true,
      message: 'Time clock status fetched successfully',
      data: {
        state: openBreak ? 'ON_BREAK' : 'CLOCKED_IN',
        nextPunchAction: openBreak
          ? 'BREAK_END'
          : completedBreakCount > 0
            ? 'CLOCK_OUT'
            : 'BREAK_START',
        employeeProfileId: profile.id,
        openSession,
        openBreak,
        totalBreakMinutes,
        allowedBreakMinutes,
        breakUsageStatus:
          totalBreakMinutes > allowedBreakMinutes ? 'LATE' : 'ON_TIME',
      },
    }
  } catch (error: any) {
    console.error('Error fetching time clock status:', error)
    return {
      success: false,
      message: 'Failed to fetch time clock status',
      error: error?.message,
    }
  }
}
