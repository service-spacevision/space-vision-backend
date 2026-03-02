import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import {
  hrPolicyConfigs,
  NewHrPolicyConfig,
} from '../../../models/HrPolicyConfig'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  id: number
  data: Partial<NewHrPolicyConfig>
}

export async function updateHrPolicyConfig_func({
  reqObject,
  id,
  data,
}: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const [existing] = await db
      .select()
      .from(hrPolicyConfigs)
      .where(
        and(eq(hrPolicyConfigs.id, id), eq(hrPolicyConfigs.organizationId, orgId)),
      )
      .limit(1)

    if (!existing) return { success: false, message: 'HR policy not found' }

    const [updated] = await db
      .update(hrPolicyConfigs)
      .set({
        ...(typeof data.policyName === 'string'
          ? { policyName: data.policyName }
          : {}),
        ...(typeof data.casualLeaveNoticeDays === 'number'
          ? { casualLeaveNoticeDays: data.casualLeaveNoticeDays }
          : {}),
        ...(typeof data.maxConsecutiveLeaveDays === 'number'
          ? { maxConsecutiveLeaveDays: data.maxConsecutiveLeaveDays }
          : {}),
        ...(typeof data.probationDays === 'number'
          ? { probationDays: data.probationDays }
          : {}),
        ...(typeof data.allowedBreakMinutes === 'number'
          ? { allowedBreakMinutes: data.allowedBreakMinutes }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(hrPolicyConfigs.id, id))
      .returning()

    return {
      success: true,
      message: 'HR policy updated successfully',
      data: updated,
    }
  } catch (error: any) {
    console.error('Error updating HR policy:', error)
    return {
      success: false,
      message: 'Failed to update HR policy',
      error: error?.message,
    }
  }
}
