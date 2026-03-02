import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import {
  hrEmployeeProfiles,
  NewHrEmployeeProfile,
} from '../../../models/HrEmployeeProfile'
import { hrPolicyConfigs } from '../../../models/HrPolicyConfig'
import { users } from '../../../models/User'
import { ReqObjectType } from '../../../utils/types'

interface AssignHrEmployeeProfileParams {
  reqObject: ReqObjectType
  data: NewHrEmployeeProfile
}

function normalizeNullableDate(value: unknown) {
  if (value === '' || value === null || value === undefined) return null
  return value as any
}

export async function assignHrEmployeeProfile_func({
  reqObject,
  data,
}: AssignHrEmployeeProfileParams) {
  try {
    const actorOrgId = Number(reqObject.user.organizationId)
    const incomingOrgId = data.organizationId
      ? Number(data.organizationId)
      : actorOrgId

    if (!incomingOrgId) {
      return {
        success: false,
        message: 'Organization is required for employee assignment',
      }
    }

    const [targetUser] = await db
      .select({
        id: users.id,
        organizationId: users.organizationId,
      })
      .from(users)
      .where(eq(users.id, Number(data.userId)))
      .limit(1)

    if (!targetUser) {
      return { success: false, message: 'User not found' }
    }

    if (Number(targetUser.organizationId) !== incomingOrgId) {
      return {
        success: false,
        message: 'User does not belong to the selected organization',
      }
    }

    if (data.reportsToUserId) {
      const [manager] = await db
        .select({ id: users.id, organizationId: users.organizationId })
        .from(users)
        .where(eq(users.id, Number(data.reportsToUserId)))
        .limit(1)

      if (!manager) {
        return { success: false, message: 'Reporting manager not found' }
      }

      if (Number(manager.organizationId) !== incomingOrgId) {
        return {
          success: false,
          message: 'Reporting manager does not belong to the organization',
        }
      }
    }

    const [existing] = await db
      .select()
      .from(hrEmployeeProfiles)
      .where(
        and(
          eq(hrEmployeeProfiles.userId, Number(data.userId)),
          eq(hrEmployeeProfiles.organizationId, incomingOrgId),
        ),
      )
      .limit(1)

    if (existing) {
      return {
        success: false,
        message: 'Employee profile already exists for this user and organization',
      }
    }

    const [appliedPolicy] = await db
      .select()
      .from(hrPolicyConfigs)
      .where(
        and(
          eq(hrPolicyConfigs.organizationId, incomingOrgId),
          eq(hrPolicyConfigs.isApplied, true),
        ),
      )
      .limit(1)

    const joinDate = normalizeNullableDate((data as any).joinDate) as
      | Date
      | string
      | null
    let probationStartAt = normalizeNullableDate(
      (data as any).probationStartAt,
    ) as Date | string | null
    let probationEndAt = normalizeNullableDate((data as any).probationEndAt) as
      | Date
      | string
      | null
    let leaveEligibilityStartAt = normalizeNullableDate(
      (data as any).leaveEligibilityStartAt,
    ) as Date | string | null

    if (
      data.isProbationApplicable !== false &&
      joinDate &&
      !probationStartAt &&
      !probationEndAt &&
      Number(appliedPolicy?.probationDays || 0) > 0
    ) {
      const joinAt = new Date(joinDate as any)
      probationStartAt = joinAt
      const probationEnd = new Date(joinAt)
      probationEnd.setDate(probationEnd.getDate() + Number(appliedPolicy?.probationDays || 0))
      probationEndAt = probationEnd
    }

    if (!leaveEligibilityStartAt) {
      leaveEligibilityStartAt =
        data.isProbationApplicable === false
          ? (joinDate as any)
          : (probationEndAt as any) || (joinDate as any)
    }

    const [created] = await db
      .insert(hrEmployeeProfiles)
      .values({
        ...data,
        joinDate: joinDate as any,
        probationStartAt: probationStartAt as any,
        probationEndAt: probationEndAt as any,
        leaveEligibilityStartAt: leaveEligibilityStartAt as any,
        contractStartAt: normalizeNullableDate((data as any).contractStartAt),
        contractEndAt: normalizeNullableDate((data as any).contractEndAt),
        ...(data.isProbationApplicable === false
          ? {
              probationStartAt: null,
              probationEndAt: null,
            }
          : {}),
        organizationId: incomingOrgId,
      })
      .returning()

    return {
      success: true,
      message: 'Employee profile assigned successfully',
      data: created,
    }
  } catch (error: any) {
    if (error?.code === '23505') {
      return {
        success: false,
        message: 'Employee profile already exists for this user and organization',
      }
    }

    console.error('Error assigning employee profile:', error)
    return {
      success: false,
      message: 'Failed to assign employee profile',
      error: error?.message,
    }
  }
}
