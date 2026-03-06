import { db } from '../../../db/connection'
import { hrShifts } from '../../../models/HrShift'
import { ReqObjectType } from '../../../utils/types'
import { getEmployeeProfile, hasShiftOverlap, logShiftEvent } from './_helpers'

interface Params {
  reqObject: ReqObjectType
  data: {
    employeeProfileId: number
    shiftStartAt: string
    shiftEndAt: string
    notes?: string | null
  }
}

export async function createManualHrShift_func({ reqObject, data }: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const employee = await getEmployeeProfile(orgId, Number(data.employeeProfileId))
    if (!employee) return { success: false, message: 'Employee profile not found' }

    const shiftStartAt = new Date(String(data.shiftStartAt))
    const shiftEndAt = new Date(String(data.shiftEndAt))
    if (isNaN(shiftStartAt.getTime()) || isNaN(shiftEndAt.getTime())) {
      return { success: false, message: 'Invalid shift start/end datetime' }
    }
    if (shiftEndAt <= shiftStartAt) {
      return { success: false, message: 'shiftEndAt must be later than shiftStartAt' }
    }

    const overlap = await hasShiftOverlap({
      orgId,
      employeeProfileId: Number(employee.id),
      shiftStartAt,
      shiftEndAt,
    })
    if (overlap) return { success: false, message: 'Shift overlaps with existing scheduled shift' }

    const [created] = await db
      .insert(hrShifts)
      .values({
        organizationId: orgId,
        employeeProfileId: Number(employee.id),
        shiftStartAt,
        shiftEndAt,
        source: 'MANUAL',
        status: 'SCHEDULED',
        notes: data.notes || null,
        createdByUserId: Number(reqObject.user.id),
      })
      .returning()

    await logShiftEvent({
      organizationId: orgId,
      shiftId: Number(created.id),
      employeeProfileId: Number(employee.id),
      actorUserId: Number(reqObject.user.id),
      eventType: 'SHIFT_CREATED_MANUAL',
      payload: {
        shiftStartAt: created.shiftStartAt,
        shiftEndAt: created.shiftEndAt,
        source: created.source,
        status: created.status,
      },
    })

    return { success: true, message: 'Manual shift created successfully', data: created }
  } catch (error: any) {
    console.error('Error creating manual shift:', error)
    return { success: false, message: 'Failed to create manual shift', error: error?.message }
  }
}
