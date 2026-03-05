import { and, desc, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrLeaveBalances } from '../../../models/HrLeaveBalance'
import { hrLeaveTypes } from '../../../models/HrLeaveType'
import { ReqObjectType } from '../../../utils/types'
import { getEmployeeProfileByUserId } from './_helpers'

interface Params {
  reqObject: ReqObjectType
  year?: number
}

export async function getMyHrLeaveBalances_func({ reqObject, year }: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    const userId = Number(reqObject.user.id)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const employeeProfile = await getEmployeeProfileByUserId(orgId, userId)
    if (!employeeProfile) {
      return { success: false, message: 'HR employee profile not found for user' }
    }

    const currentYear = Number(year || new Date().getUTCFullYear())
    const rows = await db
      .select({
        balance: hrLeaveBalances,
        leaveType: {
          id: hrLeaveTypes.id,
          code: hrLeaveTypes.code,
          displayName: hrLeaveTypes.displayName,
          annualAllocationDays: hrLeaveTypes.annualAllocationDays,
        },
      })
      .from(hrLeaveBalances)
      .leftJoin(hrLeaveTypes, eq(hrLeaveTypes.id, hrLeaveBalances.leaveTypeId))
      .where(
        and(
          eq(hrLeaveBalances.organizationId, orgId),
          eq(hrLeaveBalances.employeeProfileId, Number(employeeProfile.id)),
          eq(hrLeaveBalances.year, currentYear),
        ),
      )
      .orderBy(desc(hrLeaveBalances.id))

    return {
      success: true,
      message: rows.length > 0 ? 'Leave balances fetched successfully' : 'No leave balances found',
      data: rows,
    }
  } catch (error: any) {
    console.error('Error fetching my leave balances:', error)
    return {
      success: false,
      message: 'Failed to fetch leave balances',
      error: error?.message,
    }
  }
}

