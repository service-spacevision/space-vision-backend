import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrPolicyConfigs } from '../../../models/HrPolicyConfig'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  id: number
}

export async function deleteHrPolicyConfig_func({ reqObject, id }: Params) {
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
    if (existing.isApplied) {
      return {
        success: false,
        message: 'Cannot delete an applied policy. Apply another policy first.',
      }
    }

    const [deleted] = await db
      .delete(hrPolicyConfigs)
      .where(eq(hrPolicyConfigs.id, id))
      .returning()

    return {
      success: true,
      message: 'HR policy deleted successfully',
      data: deleted,
    }
  } catch (error: any) {
    console.error('Error deleting HR policy:', error)
    return {
      success: false,
      message: 'Failed to delete HR policy',
      error: error?.message,
    }
  }
}
