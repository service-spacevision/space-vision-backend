import { desc, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrPolicyConfigs } from '../../../models/HrPolicyConfig'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  organizationId?: number
}

export async function getHrPolicyConfig_func({
  reqObject,
  organizationId,
}: Params) {
  try {
    const orgId = Number(organizationId || reqObject.user.organizationId)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const rows = await db
      .select()
      .from(hrPolicyConfigs)
      .where(eq(hrPolicyConfigs.organizationId, orgId))
      .orderBy(desc(hrPolicyConfigs.updatedAt))

    const row = rows.find((p: any) => p.isApplied === true) || rows[0]

    if (!row) {
      return {
        success: false,
        message: 'HR policy not found for organization',
        data: null,
      }
    }

    return {
      success: true,
      message: 'HR policy fetched successfully',
      data: row,
    }
  } catch (error: any) {
    console.error('Error fetching HR policy:', error)
    return {
      success: false,
      message: 'Failed to fetch HR policy',
      error: error?.message,
    }
  }
}
