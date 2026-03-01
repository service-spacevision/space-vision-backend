import { and, desc, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrEmployeeProfiles } from '../../../models/HrEmployeeProfile'
import { hrTimeBreakApprovals } from '../../../models/HrTimeBreakApproval'
import { hrTimeBreaks } from '../../../models/HrTimeBreak'
import { hrTimeSessions } from '../../../models/HrTimeSession'
import { users } from '../../../models/User'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
}

export async function getPendingBreakApprovals_func({ reqObject }: Params) {
  try {
    const approverUserId = Number(reqObject.user.id)
    const organizationId = Number(reqObject.user.organizationId)

    const rows = await db
      .select({
        approval: hrTimeBreakApprovals,
        timeBreak: hrTimeBreaks,
        session: hrTimeSessions,
        employeeProfile: hrEmployeeProfiles,
        employeeUser: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          username: users.username,
        },
      })
      .from(hrTimeBreakApprovals)
      .innerJoin(
        hrTimeBreaks,
        eq(hrTimeBreaks.id, hrTimeBreakApprovals.timeBreakId),
      )
      .innerJoin(
        hrTimeSessions,
        eq(hrTimeSessions.id, hrTimeBreaks.timeSessionId),
      )
      .innerJoin(
        hrEmployeeProfiles,
        eq(hrEmployeeProfiles.id, hrTimeSessions.employeeProfileId),
      )
      .leftJoin(users, eq(users.id, hrEmployeeProfiles.userId))
      .where(
        and(
          eq(hrTimeBreakApprovals.organizationId, organizationId),
          eq(hrTimeBreakApprovals.approverUserId, approverUserId),
          eq(hrTimeBreakApprovals.status, 'PENDING'),
        ),
      )
      .orderBy(desc(hrTimeBreakApprovals.requestedAt))

    return {
      success: true,
      message: 'Pending break approvals fetched successfully',
      data: rows,
    }
  } catch (error: any) {
    console.error('Error fetching pending break approvals:', error)
    return {
      success: false,
      message: 'Failed to fetch pending break approvals',
      error: error?.message,
    }
  }
}
