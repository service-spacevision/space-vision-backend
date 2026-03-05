import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrLeaveTypes } from '../../../models/HrLeaveType'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  id: number
}

export async function getHrLeaveTypeById_func({ reqObject, id }: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const [row] = await db
      .select()
      .from(hrLeaveTypes)
      .where(
        and(
          eq(hrLeaveTypes.id, Number(id)),
          eq(hrLeaveTypes.organizationId, orgId),
        ),
      )
      .limit(1)

    if (!row) return { success: false, message: 'Leave type not found' }
    return { success: true, message: 'Leave type fetched successfully', data: row }
  } catch (error: any) {
    console.error('Error fetching leave type by id:', error)
    return {
      success: false,
      message: 'Failed to fetch leave type',
      error: error?.message,
    }
  }
}

