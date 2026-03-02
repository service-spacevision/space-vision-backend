import { and, count, desc, eq, ilike } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrPolicyConfigs } from '../../../models/HrPolicyConfig'
import { IPagination, ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  organizationId?: number
  pagination?: IPagination
  searchQuery?: string
}

export async function listHrPolicyConfigs_func({
  reqObject,
  organizationId,
  pagination,
  searchQuery,
}: Params) {
  try {
    const orgId = Number(organizationId || reqObject.user.organizationId)
    if (!orgId) {
      return { success: false, message: 'Organization not found for user' }
    }

    const search = (searchQuery || '').trim()
    const filter = search
      ? and(
          eq(hrPolicyConfigs.organizationId, orgId),
          ilike(hrPolicyConfigs.policyName, `%${search}%`),
        )
      : eq(hrPolicyConfigs.organizationId, orgId)

    const all = pagination?.all === 'true' || pagination?.all === '1'
    if (all) {
      const rows = await db
        .select()
        .from(hrPolicyConfigs)
        .where(filter)
        .orderBy(desc(hrPolicyConfigs.isApplied), desc(hrPolicyConfigs.updatedAt), desc(hrPolicyConfigs.id))

      return {
        success: true,
        message: rows.length > 0 ? 'HR policies fetched successfully' : 'No HR policies found',
        data: rows,
        pagination: {
          total: rows.length,
          page: 1,
          pageSize: rows.length,
        },
      }
    }

    const page = pagination?.currentPage || 1
    const pageSize = pagination?.pageSize || 10
    const offset = (page - 1) * pageSize

    const rows = await db
      .select()
      .from(hrPolicyConfigs)
      .where(filter)
      .orderBy(desc(hrPolicyConfigs.isApplied), desc(hrPolicyConfigs.updatedAt), desc(hrPolicyConfigs.id))
      .limit(pageSize)
      .offset(offset)

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrPolicyConfigs)
      .where(filter)

    return {
      success: true,
      message: rows.length > 0 ? 'HR policies fetched successfully' : 'No HR policies found',
      data: rows,
      pagination: {
        total: Number(totalRow?.total || 0),
        page,
        pageSize,
      },
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
