import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrLeaveBalances } from '../../../models/HrLeaveBalance'
import { hrLeaveRequests } from '../../../models/HrLeaveRequest'
import { hrLeaveTypes } from '../../../models/HrLeaveType'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  id: number
}

export async function deleteHrLeaveType_func({ reqObject, id }: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const [existing] = await db
      .select()
      .from(hrLeaveTypes)
      .where(
        and(
          eq(hrLeaveTypes.id, Number(id)),
          eq(hrLeaveTypes.organizationId, orgId),
        ),
      )
      .limit(1)
    if (!existing) return { success: false, message: 'Leave type not found' }

    const [hasRequests] = await db
      .select({ id: hrLeaveRequests.id })
      .from(hrLeaveRequests)
      .where(
        and(
          eq(hrLeaveRequests.organizationId, orgId),
          eq(hrLeaveRequests.leaveTypeId, Number(id)),
        ),
      )
      .limit(1)
    if (hasRequests) {
      return { success: false, message: 'Cannot delete leave type because leave requests already exist' }
    }

    const [hasBalances] = await db
      .select({ id: hrLeaveBalances.id })
      .from(hrLeaveBalances)
      .where(
        and(
          eq(hrLeaveBalances.organizationId, orgId),
          eq(hrLeaveBalances.leaveTypeId, Number(id)),
        ),
      )
      .limit(1)
    if (hasBalances) {
      return { success: false, message: 'Cannot delete leave type because leave balances already exist' }
    }

    const [deleted] = await db
      .delete(hrLeaveTypes)
      .where(eq(hrLeaveTypes.id, Number(id)))
      .returning()

    return { success: true, message: 'Leave type deleted successfully', data: deleted }
  } catch (error: any) {
    console.error('Error deleting leave type:', error)
    return {
      success: false,
      message: 'Failed to delete leave type',
      error: error?.message,
    }
  }
}

