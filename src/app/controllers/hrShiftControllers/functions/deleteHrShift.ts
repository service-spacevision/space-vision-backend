import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrShifts } from '../../../models/HrShift'
import { ReqObjectType } from '../../../utils/types'
import { logShiftEvent } from './_helpers'

interface Params {
  reqObject: ReqObjectType
  id: number
}

export async function deleteHrShift_func({ reqObject, id }: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const [existing] = await db
      .select()
      .from(hrShifts)
      .where(
        and(
          eq(hrShifts.id, Number(id)),
          eq(hrShifts.organizationId, orgId),
        ),
      )
      .limit(1)
    if (!existing) return { success: false, message: 'Shift not found' }

    const [updated] = await db
      .update(hrShifts)
      .set({
        status: 'CANCELLED',
        updatedByUserId: Number(reqObject.user.id),
        updatedAt: new Date(),
      })
      .where(eq(hrShifts.id, Number(id)))
      .returning()

    await logShiftEvent({
      organizationId: orgId,
      shiftId: Number(updated.id),
      employeeProfileId: Number(existing.employeeProfileId),
      actorUserId: Number(reqObject.user.id),
      eventType: 'SHIFT_CANCELLED',
      payload: {
        previousStatus: existing.status,
        status: updated.status,
      },
    })

    return { success: true, message: 'Shift cancelled successfully', data: updated }
  } catch (error: any) {
    console.error('Error deleting shift:', error)
    return { success: false, message: 'Failed to delete shift', error: error?.message }
  }
}
