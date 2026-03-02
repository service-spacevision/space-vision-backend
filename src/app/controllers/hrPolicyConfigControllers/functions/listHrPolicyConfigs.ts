import { desc, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrPolicyConfigs } from '../../../models/HrPolicyConfig'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  organizationId?: number
}

export async function listHrPolicyConfigs_func({ reqObject, organizationId }: Params) {
  try {
    const orgId = Number(organizationId || reqObject.user.organizationId)
    if (!orgId) {
      return { success: false, message: 'Organization not found for user' }
    }

    const rows = await db
      .select()
      .from(hrPolicyConfigs)
      .where(eq(hrPolicyConfigs.organizationId, orgId))
      .orderBy(desc(hrPolicyConfigs.isApplied), desc(hrPolicyConfigs.updatedAt), desc(hrPolicyConfigs.id))

    return {
      success: true,
      message: rows.length > 0 ? 'HR policies fetched successfully' : 'No HR policies found',
      data: rows,
    }
  } catch (error: any) {
    console.error('Error fetching HR policies:', error)
    return {
      success: false,
      message: 'Failed to fetch HR policies',
      error: error?.message,
    }
  }
}
