import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrEmployeeProfiles } from '../../../models/HrEmployeeProfile'
import { hrPolicyConfigs } from '../../../models/HrPolicyConfig'
import { users } from '../../../models/User'
import { ReqObjectType } from '../../../utils/types'

interface GetHrEmployeeProfileByIdParams {
  reqObject: ReqObjectType
  id: number
}

export async function getHrEmployeeProfileById_func({
  reqObject,
  id,
}: GetHrEmployeeProfileByIdParams) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    if (!orgId) {
      return { success: false, message: 'Organization not found for user' }
    }

    const [row] = await db
      .select({
        profile: hrEmployeeProfiles,
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          username: users.username,
          organizationId: users.organizationId,
        },
        policy: {
          id: hrPolicyConfigs.id,
          policyName: hrPolicyConfigs.policyName,
          isApplied: hrPolicyConfigs.isApplied,
        },
      })
      .from(hrEmployeeProfiles)
      .leftJoin(users, eq(users.id, hrEmployeeProfiles.userId))
      .leftJoin(hrPolicyConfigs, eq(hrPolicyConfigs.id, hrEmployeeProfiles.policyId))
      .where(
        and(
          eq(hrEmployeeProfiles.id, Number(id)),
          eq(hrEmployeeProfiles.organizationId, orgId),
        ),
      )
      .limit(1)

    if (!row) {
      return { success: false, message: 'Employee profile not found' }
    }

    return {
      success: true,
      message: 'Employee profile fetched successfully',
      data: row,
    }
  } catch (error: any) {
    console.error('Error fetching employee profile:', error)
    return {
      success: false,
      message: 'Failed to fetch employee profile',
      error: error?.message,
    }
  }
}
