import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import {
  hrEmployeeProfiles,
  NewHrEmployeeProfile,
} from '../../../models/HrEmployeeProfile'
import { hrPolicyConfigs } from '../../../models/HrPolicyConfig'
import { users } from '../../../models/User'
import { ReqObjectType } from '../../../utils/types'

interface UpdateHrEmployeeProfileParams {
  reqObject: ReqObjectType
  id: number
  data: Partial<NewHrEmployeeProfile>
}

function normalizeNullableDate(value: unknown) {
  if (value === '' || value === null || value === undefined) return null
  return value as any
}

export async function updateHrEmployeeProfile_func({
  reqObject,
  id,
  data,
}: UpdateHrEmployeeProfileParams) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    if (!orgId) {
      return { success: false, message: 'Organization not found for user' }
    }

    const [existing] = await db
      .select()
      .from(hrEmployeeProfiles)
      .where(
        and(
          eq(hrEmployeeProfiles.id, Number(id)),
          eq(hrEmployeeProfiles.organizationId, orgId),
        ),
      )
      .limit(1)

    if (!existing) {
      return { success: false, message: 'Employee profile not found' }
    }

    const hasPolicyIdField = Object.prototype.hasOwnProperty.call(data, 'policyId')
    if (hasPolicyIdField && (data as any).policyId !== null && (data as any).policyId !== undefined) {
      const [selectedPolicy] = await db
        .select({ id: hrPolicyConfigs.id, organizationId: hrPolicyConfigs.organizationId })
        .from(hrPolicyConfigs)
        .where(eq(hrPolicyConfigs.id, Number((data as any).policyId)))
        .limit(1)

      if (!selectedPolicy) {
        return { success: false, message: 'Selected policy not found' }
      }

      if (Number(selectedPolicy.organizationId) !== orgId) {
        return {
          success: false,
          message: 'Selected policy does not belong to this organization',
        }
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

      if (Number(manager.organizationId) !== orgId) {
        return {
          success: false,
          message: 'Reporting manager does not belong to the organization',
        }
      }
    }

    const [updated] = await db
      .update(hrEmployeeProfiles)
      .set({
        ...data,
        ...(Object.prototype.hasOwnProperty.call(data, 'joinDate')
          ? { joinDate: normalizeNullableDate((data as any).joinDate) }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(data, 'probationStartAt')
          ? {
              probationStartAt: normalizeNullableDate(
                (data as any).probationStartAt,
              ),
            }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(data, 'probationEndAt')
          ? {
              probationEndAt: normalizeNullableDate((data as any).probationEndAt),
            }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(data, 'leaveEligibilityStartAt')
          ? {
              leaveEligibilityStartAt: normalizeNullableDate(
                (data as any).leaveEligibilityStartAt,
              ),
            }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(data, 'contractStartAt')
          ? {
              contractStartAt: normalizeNullableDate((data as any).contractStartAt),
            }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(data, 'contractEndAt')
          ? {
              contractEndAt: normalizeNullableDate((data as any).contractEndAt),
            }
          : {}),
        ...(data.isProbationApplicable === false
          ? {
              probationStartAt: null,
              probationEndAt: null,
            }
          : {}),
        ...(hasPolicyIdField
          ? (data as any).policyId === null
            ? {
                policyId: null,
                policyAssignedAt: null,
                policyAssignedByUserId: null,
              }
            : Number((data as any).policyId) !== Number(existing.policyId || 0)
              ? {
                  policyAssignedAt: new Date(),
                  policyAssignedByUserId: Number(reqObject.user.id),
                }
              : {}
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(hrEmployeeProfiles.id, Number(id)))
      .returning()

    return {
      success: true,
      message: 'Employee profile updated successfully',
      data: updated,
    }
  } catch (error: any) {
    console.error('Error updating employee profile:', error)
    return {
      success: false,
      message: 'Failed to update employee profile',
      error: error?.message,
    }
  }
}
