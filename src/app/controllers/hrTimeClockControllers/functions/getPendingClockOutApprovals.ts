import { and, desc, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrEmployeeProfiles } from '../../../models/HrEmployeeProfile'
import { hrTimeSessionApprovals } from '../../../models/HrTimeSessionApproval'
import { hrTimeSessions } from '../../../models/HrTimeSession'
import { users } from '../../../models/User'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
}

export async function getPendingClockOutApprovals_func({ reqObject }: Params) {
  try {
    const approverUserId = Number(reqObject.user.id)
    const organizationId = Number(reqObject.user.organizationId)

    const rows = await db
      .select({
        approval: hrTimeSessionApprovals,
        session: hrTimeSessions,
        employeeProfile: hrEmployeeProfiles,
        employeeUser: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          username: users.username,
        },
      })
      .from(hrTimeSessionApprovals)
      .innerJoin(
        hrTimeSessions,
        eq(hrTimeSessions.id, hrTimeSessionApprovals.timeSessionId),
      )
      .innerJoin(
        hrEmployeeProfiles,
        eq(hrEmployeeProfiles.id, hrTimeSessions.employeeProfileId),
      )
      .leftJoin(users, eq(users.id, hrEmployeeProfiles.userId))
      .where(
        and(
          eq(hrTimeSessionApprovals.organizationId, organizationId),
          eq(hrTimeSessionApprovals.approverUserId, approverUserId),
          eq(hrTimeSessionApprovals.status, 'PENDING'),
        ),
      )
      .orderBy(desc(hrTimeSessionApprovals.requestedAt))

    return {
      success: true,
      message: 'Pending clock-out approvals fetched successfully',
      data: rows,
    }
  } catch (error: any) {
    console.error('Error fetching pending clock-out approvals:', error)
    return {
      success: false,
      message: 'Failed to fetch pending clock-out approvals',
      error: error?.message,
    }
  }
}
