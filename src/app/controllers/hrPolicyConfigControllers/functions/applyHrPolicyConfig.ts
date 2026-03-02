import { eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import {
  hrPolicyConfigs,
} from '../../../models/HrPolicyConfig'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  data: {
    policyId: number
    organizationId?: number
  }
}

export async function applyHrPolicyConfig_func({ reqObject, data }: Params) {
  try {
    const organizationId = Number(
      data.organizationId || reqObject.user.organizationId,
    )
    if (!organizationId) {
      return { success: false, message: 'Organization not found for user' }
    }

    const [targetPolicy] = await db
      .select()
      .from(hrPolicyConfigs)
      .where(eq(hrPolicyConfigs.id, Number(data.policyId)))
      .limit(1)

    if (!targetPolicy) {
      return { success: false, message: 'Policy not found' }
    }

    if (Number(targetPolicy.organizationId) !== organizationId) {
      return {
        success: false,
        message: 'Policy does not belong to this organization',
      }
    }

    await db
      .update(hrPolicyConfigs)
      .set({
        isApplied: false,
        updatedAt: new Date(),
      })
      .where(eq(hrPolicyConfigs.organizationId, organizationId))

    const [updated] = await db
      .update(hrPolicyConfigs)
      .set({
        isApplied: true,
        appliedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(hrPolicyConfigs.id, Number(data.policyId)))
      .returning()

    return {
      success: true,
      message: 'HR policy applied successfully',
      data: updated,
    }
  } catch (error: any) {
    console.error('Error applying HR policy:', error)
    return {
      success: false,
      message: 'Failed to apply HR policy',
      error: error?.message,
    }
  }
}
