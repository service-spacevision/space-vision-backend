import { and, count, desc, eq, gte, lte } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrEmployeeProfiles } from '../../../models/HrEmployeeProfile'
import { hrShifts } from '../../../models/HrShift'
import { users } from '../../../models/User'
import { IPagination, ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  pagination?: IPagination
  filters?: {
    employeeProfileId?: number
    shiftGroupId?: number
    startDate?: string
    endDate?: string
  }
}

export async function getHrShifts_func({ reqObject, pagination, filters }: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const whereParts: any[] = [eq(hrShifts.organizationId, orgId)]
    if (filters?.employeeProfileId) whereParts.push(eq(hrShifts.employeeProfileId, Number(filters.employeeProfileId)))
    if (filters?.shiftGroupId) whereParts.push(eq(hrShifts.shiftGroupId, Number(filters.shiftGroupId)))
    if (filters?.startDate) whereParts.push(gte(hrShifts.shiftStartAt, new Date(`${filters.startDate}T00:00:00.000Z`) as any))
    if (filters?.endDate) whereParts.push(lte(hrShifts.shiftStartAt, new Date(`${filters.endDate}T23:59:59.999Z`) as any))
    const where = and(...whereParts)

    const all = pagination?.all === 'true' || pagination?.all === '1'
    if (all) {
      const rows = await db
        .select({
          shift: hrShifts,
          employee: {
            profileId: hrEmployeeProfiles.id,
            employeeCode: hrEmployeeProfiles.employeeCode,
            userId: users.id,
            fullName: users.fullName,
            email: users.email,
          },
        })
        .from(hrShifts)
        .leftJoin(hrEmployeeProfiles, eq(hrEmployeeProfiles.id, hrShifts.employeeProfileId))
        .leftJoin(users, eq(users.id, hrEmployeeProfiles.userId))
        .where(where)
        .orderBy(desc(hrShifts.shiftStartAt), desc(hrShifts.id))

      return {
        success: true,
        message: rows.length > 0 ? 'Shifts fetched successfully' : 'No shifts found',
        data: rows,
        pagination: { total: rows.length, page: 1, pageSize: rows.length },
      }
    }

    const page = pagination?.currentPage || 1
    const pageSize = pagination?.pageSize || 10
    const offset = (page - 1) * pageSize

    const rows = await db
      .select({
        shift: hrShifts,
        employee: {
          profileId: hrEmployeeProfiles.id,
          employeeCode: hrEmployeeProfiles.employeeCode,
          userId: users.id,
          fullName: users.fullName,
          email: users.email,
        },
      })
      .from(hrShifts)
      .leftJoin(hrEmployeeProfiles, eq(hrEmployeeProfiles.id, hrShifts.employeeProfileId))
      .leftJoin(users, eq(users.id, hrEmployeeProfiles.userId))
      .where(where)
      .orderBy(desc(hrShifts.shiftStartAt), desc(hrShifts.id))
      .limit(pageSize)
      .offset(offset)

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrShifts)
      .where(where)

    return {
      success: true,
      message: rows.length > 0 ? 'Shifts fetched successfully' : 'No shifts found',
      data: rows,
      pagination: { total: Number(totalRow?.total || 0), page, pageSize },
    }
  } catch (error: any) {
    console.error('Error fetching shifts:', error)
    return { success: false, message: 'Failed to fetch shifts', error: error?.message }
  }
}

