import { and, desc, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrLeaveBalances } from '../../../models/HrLeaveBalance'
import { hrLeaveTypes } from '../../../models/HrLeaveType'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  employeeProfileId: number
  year?: number
}

export async function getEmployeeHrLeaveBalances_func({
  reqObject,
  employeeProfileId,
  year,
}: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

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
          eq(hrLeaveBalances.employeeProfileId, Number(employeeProfileId)),
          eq(hrLeaveBalances.year, currentYear),
        ),
      )
      .orderBy(desc(hrLeaveBalances.id))

    return {
      success: true,
      message: rows.length > 0 ? 'Employee leave balances fetched successfully' : 'No leave balances found',
      data: rows,
    }
  } catch (error: any) {
    console.error('Error fetching employee leave balances:', error)
    return {
      success: false,
      message: 'Failed to fetch employee leave balances',
      error: error?.message,
    }
  }
}

