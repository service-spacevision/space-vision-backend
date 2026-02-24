import { and, count, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrEmployeeProfiles } from '../../../models/HrEmployeeProfile'
import { users } from '../../../models/User'
import { IPagination, ReqObjectType } from '../../../utils/types'

interface GetHrEmployeeProfilesParams {
  reqObject: ReqObjectType
  pagination?: IPagination
  searchQuery?: string
}

export async function getHrEmployeeProfiles_func({
  reqObject,
  pagination,
  searchQuery,
}: GetHrEmployeeProfilesParams) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    if (!orgId) {
      return { success: false, message: 'Organization not found for user' }
    }

    const search = (searchQuery || '').trim()
    const filter = search
      ? and(
          eq(hrEmployeeProfiles.organizationId, orgId),
          or(
            ilike(hrEmployeeProfiles.employeeCode, `%${search}%`),
            ilike(hrEmployeeProfiles.jobTitle, `%${search}%`),
            ilike(users.fullName, `%${search}%`),
            ilike(users.email, `%${search}%`),
            ilike(users.username, `%${search}%`),
          ),
        )
      : eq(hrEmployeeProfiles.organizationId, orgId)

    const all = pagination?.all === 'true' || pagination?.all === '1'
    if (all) {
      const rows = await db
        .select({
          profile: hrEmployeeProfiles,
          user: {
            id: users.id,
            email: users.email,
            fullName: users.fullName,
            username: users.username,
            organizationId: users.organizationId,
          },
        })
        .from(hrEmployeeProfiles)
        .leftJoin(users, eq(users.id, hrEmployeeProfiles.userId))
        .where(filter)
        .orderBy(desc(hrEmployeeProfiles.id))

      return {
        success: true,
        message: rows.length > 0 ? 'Employee profiles fetched successfully' : 'No employee profiles found',
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
      .select({
        profile: hrEmployeeProfiles,
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          username: users.username,
          organizationId: users.organizationId,
        },
      })
      .from(hrEmployeeProfiles)
      .leftJoin(users, eq(users.id, hrEmployeeProfiles.userId))
      .where(filter)
      .orderBy(desc(hrEmployeeProfiles.id))
      .limit(pageSize)
      .offset(offset)

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrEmployeeProfiles)
      .leftJoin(users, eq(users.id, hrEmployeeProfiles.userId))
      .where(filter)

    return {
      success: true,
      message: rows.length > 0 ? 'Employee profiles fetched successfully' : 'No employee profiles found',
      data: rows,
      pagination: {
        total: Number(totalRow?.total || 0),
        page,
        pageSize,
      },
    }
  } catch (error: any) {
    console.error('Error fetching employee profiles:', error)
    return {
      success: false,
      message: 'Failed to fetch employee profiles',
      error: error?.message,
    }
  }
}
