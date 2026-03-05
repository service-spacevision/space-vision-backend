import { and, count, desc, eq, ilike } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrLeaveTypes } from '../../../models/HrLeaveType'
import { organizations } from '../../../models/Organization'
import { IPagination, ReqObjectType } from '../../../utils/types'
import { hasSystemRole } from '../../../utils/roleHelpers'

interface Params {
  reqObject: ReqObjectType
  organizationId?: number
  pagination?: IPagination
  searchQuery?: string
}

export async function getHrLeaveTypes_func({
  reqObject,
  organizationId,
  pagination,
  searchQuery,
}: Params) {
  try {
    const isSystemUser = await hasSystemRole(reqObject.user.id)
    const resolvedOrgId = organizationId
      ? Number(organizationId)
      : isSystemUser
        ? undefined
        : reqObject.user.organizationId
          ? Number(reqObject.user.organizationId)
          : undefined

    if (!isSystemUser && !resolvedOrgId) {
      return { success: false, message: 'Organization not found for user' }
    }

    if (resolvedOrgId) {
      const [org] = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.id, resolvedOrgId))
        .limit(1)
      if (!org) {
        return { success: false, message: 'Organization not found' }
      }
    }

    const search = (searchQuery || '').trim()
    let filter: any = undefined
    if (resolvedOrgId && search) {
      filter = and(
        eq(hrLeaveTypes.organizationId, resolvedOrgId),
        ilike(hrLeaveTypes.displayName, `%${search}%`),
      )
    } else if (resolvedOrgId) {
      filter = eq(hrLeaveTypes.organizationId, resolvedOrgId)
    } else if (search) {
      filter = ilike(hrLeaveTypes.displayName, `%${search}%`)
    }

    const all = pagination?.all === 'true' || pagination?.all === '1'
    if (all) {
      const rows = filter
        ? await db.select().from(hrLeaveTypes).where(filter).orderBy(desc(hrLeaveTypes.id))
        : await db.select().from(hrLeaveTypes).orderBy(desc(hrLeaveTypes.id))

      return {
        success: true,
        message: rows.length > 0 ? 'Leave types fetched successfully' : 'No leave types found',
        data: rows,
        pagination: { total: rows.length, page: 1, pageSize: rows.length },
      }
    }

    const page = pagination?.currentPage || 1
    const pageSize = pagination?.pageSize || 10
    const offset = (page - 1) * pageSize

    const rows = filter
      ? await db.select().from(hrLeaveTypes).where(filter).orderBy(desc(hrLeaveTypes.id)).limit(pageSize).offset(offset)
      : await db.select().from(hrLeaveTypes).orderBy(desc(hrLeaveTypes.id)).limit(pageSize).offset(offset)

    const [totalRow] = filter
      ? await db.select({ total: count() }).from(hrLeaveTypes).where(filter)
      : await db.select({ total: count() }).from(hrLeaveTypes)

    return {
      success: true,
      message: rows.length > 0 ? 'Leave types fetched successfully' : 'No leave types found',
      data: rows,
      pagination: { total: Number(totalRow?.total || 0), page, pageSize },
    }
  } catch (error: any) {
    console.error('Error fetching leave types:', error)
    return {
      success: false,
      message: 'Failed to fetch leave types',
      error: error?.message,
    }
  }
}
