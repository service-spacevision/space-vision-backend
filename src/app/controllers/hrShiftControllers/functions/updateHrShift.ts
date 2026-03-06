import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrShifts } from '../../../models/HrShift'
import { ReqObjectType } from '../../../utils/types'
import { hasShiftOverlap, logShiftEvent } from './_helpers'

interface Params {
  reqObject: ReqObjectType
  id: number
  data: {
    shiftStartAt?: string
    shiftEndAt?: string
    status?: string
    notes?: string | null
  }
}

export async function updateHrShift_func({ reqObject, id, data }: Params) {
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

    const nextStart = data.shiftStartAt ? new Date(String(data.shiftStartAt)) : new Date(existing.shiftStartAt as any)
    const nextEnd = data.shiftEndAt ? new Date(String(data.shiftEndAt)) : new Date(existing.shiftEndAt as any)
    if (isNaN(nextStart.getTime()) || isNaN(nextEnd.getTime())) {
      return { success: false, message: 'Invalid shift start/end datetime' }
    }
    if (nextEnd <= nextStart) return { success: false, message: 'shiftEndAt must be later than shiftStartAt' }

    const overlap = await hasShiftOverlap({
      orgId,
      employeeProfileId: Number(existing.employeeProfileId),
      shiftStartAt: nextStart,
      shiftEndAt: nextEnd,
      excludeShiftId: Number(existing.id),
    })
    if (overlap) return { success: false, message: 'Updated shift overlaps with existing scheduled shift' }

    const [updated] = await db
      .update(hrShifts)
      .set({
        ...(data.shiftStartAt ? { shiftStartAt: nextStart } : {}),
        ...(data.shiftEndAt ? { shiftEndAt: nextEnd } : {}),
        ...(typeof data.status === 'string' ? { status: data.status } : {}),
        ...(Object.prototype.hasOwnProperty.call(data, 'notes') ? { notes: data.notes || null } : {}),
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
      eventType: 'SHIFT_UPDATED',
      payload: {
        before: {
          shiftStartAt: existing.shiftStartAt,
          shiftEndAt: existing.shiftEndAt,
          status: existing.status,
          notes: existing.notes,
        },
        after: {
          shiftStartAt: updated.shiftStartAt,
          shiftEndAt: updated.shiftEndAt,
          status: updated.status,
          notes: updated.notes,
        },
      },
    })

    return { success: true, message: 'Shift updated successfully', data: updated }
  } catch (error: any) {
    console.error('Error updating shift:', error)
    return { success: false, message: 'Failed to update shift', error: error?.message }
  }
}
