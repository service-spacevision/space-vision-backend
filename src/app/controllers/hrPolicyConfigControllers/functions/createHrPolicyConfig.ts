import { db } from '../../../db/connection'
import { and, eq } from 'drizzle-orm'
import {
  hrPolicyConfigs,
  NewHrPolicyConfig,
} from '../../../models/HrPolicyConfig'
import { organizations } from '../../../models/Organization'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  data: Partial<NewHrPolicyConfig>
}

export async function createHrPolicyConfig_func({ reqObject, data }: Params) {
  try {
    const organizationId = Number(
      data.organizationId || reqObject.user.organizationId,
    )
    if (!organizationId) {
      return { success: false, message: 'Organization not found for user' }
    }

    if (!data.policyName || !String(data.policyName).trim()) {
      return {
        success: false,
        message: 'Policy name is required',
      }
    }
    const normalizedPolicyName = String(data.policyName).trim()

    const [organization] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1)

    if (!organization) {
      return {
        success: false,
        message: 'Organization not found',
      }
    }

    const [existingPolicyName] = await db
      .select({ id: hrPolicyConfigs.id })
      .from(hrPolicyConfigs)
      .where(
        and(
          eq(hrPolicyConfigs.organizationId, organizationId),
          eq(hrPolicyConfigs.policyName, normalizedPolicyName),
        ),
      )
      .limit(1)

    if (existingPolicyName) {
      return {
        success: false,
        message: 'Policy name already exists for this organization',
      }
    }

    const [created] = await db
      .insert(hrPolicyConfigs)
      .values({
        organizationId,
        policyName: normalizedPolicyName,
        isApplied: false,
        appliedAt: null,
        casualLeaveNoticeDays: data.casualLeaveNoticeDays,
        maxConsecutiveLeaveDays: data.maxConsecutiveLeaveDays,
        probationDays: data.probationDays,
        allowedBreakMinutes: data.allowedBreakMinutes,
      })
      .returning()

    return {
      success: true,
      message: 'HR policy created successfully',
      data: created,
    }
  } catch (error: any) {
    if (error?.code === '23505') {
      if (String(error?.constraint_name || '').includes('organization_id_key')) {
        return {
          success: false,
          message:
            'Only one policy row is currently allowed by DB schema. Run latest migration to allow multiple policy templates per organization.',
        }
      }
      if (String(error?.constraint_name || '').includes('org_policy_name_unique')) {
        return {
          success: false,
          message: 'Policy name already exists for this organization',
        }
      }
    }
    console.error('Error creating HR policy:', error)
    return {
      success: false,
      message: 'Failed to create HR policy',
      error: error?.message,
    }
  }
}
