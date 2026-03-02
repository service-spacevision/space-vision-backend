import { db } from '../../../db/connection'
import {
  hrPolicyConfigs,
  NewHrPolicyConfig,
} from '../../../models/HrPolicyConfig'
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

    const [created] = await db
      .insert(hrPolicyConfigs)
      .values({
        organizationId,
        policyName: data.policyName || 'Default Policy',
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
    console.error('Error creating HR policy:', error)
    return {
      success: false,
      message: 'Failed to create HR policy',
      error: error?.message,
    }
  }
}
