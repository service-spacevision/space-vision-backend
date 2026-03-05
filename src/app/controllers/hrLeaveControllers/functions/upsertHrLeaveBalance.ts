import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrEmployeeProfiles } from '../../../models/HrEmployeeProfile'
import { hrLeaveBalances } from '../../../models/HrLeaveBalance'
import { hrLeaveTypes } from '../../../models/HrLeaveType'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  data: {
    employeeProfileId: number
    leaveTypeId: number
    year: number
    allocatedDays?: number
    carriedOverDays?: number
    usedDays?: number
  }
}

export async function upsertHrLeaveBalance_func({ reqObject, data }: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const [employeeProfile] = await db
      .select({ id: hrEmployeeProfiles.id })
      .from(hrEmployeeProfiles)
      .where(
        and(
          eq(hrEmployeeProfiles.id, Number(data.employeeProfileId)),
          eq(hrEmployeeProfiles.organizationId, orgId),
        ),
      )
      .limit(1)
    if (!employeeProfile) return { success: false, message: 'Employee profile not found' }

    const [leaveType] = await db
      .select({ id: hrLeaveTypes.id })
      .from(hrLeaveTypes)
      .where(
        and(
          eq(hrLeaveTypes.id, Number(data.leaveTypeId)),
          eq(hrLeaveTypes.organizationId, orgId),
        ),
      )
      .limit(1)
    if (!leaveType) return { success: false, message: 'Leave type not found' }

    const [existing] = await db
      .select()
      .from(hrLeaveBalances)
      .where(
        and(
          eq(hrLeaveBalances.organizationId, orgId),
          eq(hrLeaveBalances.employeeProfileId, Number(data.employeeProfileId)),
          eq(hrLeaveBalances.leaveTypeId, Number(data.leaveTypeId)),
          eq(hrLeaveBalances.year, Number(data.year)),
        ),
      )
      .limit(1)

    if (existing) {
      const [updated] = await db
        .update(hrLeaveBalances)
        .set({
          ...(typeof data.allocatedDays === 'number'
            ? { allocatedDays: data.allocatedDays }
            : {}),
          ...(typeof data.carriedOverDays === 'number'
            ? { carriedOverDays: data.carriedOverDays }
            : {}),
          ...(typeof data.usedDays === 'number' ? { usedDays: data.usedDays } : {}),
          updatedAt: new Date(),
        })
        .where(eq(hrLeaveBalances.id, Number(existing.id)))
        .returning()

      return { success: true, message: 'Leave balance updated successfully', data: updated }
    }

    const [created] = await db
      .insert(hrLeaveBalances)
      .values({
        organizationId: orgId,
        employeeProfileId: Number(data.employeeProfileId),
        leaveTypeId: Number(data.leaveTypeId),
        year: Number(data.year),
        allocatedDays: Number(data.allocatedDays || 0),
        carriedOverDays: Number(data.carriedOverDays || 0),
        usedDays: Number(data.usedDays || 0),
      })
      .returning()

    return { success: true, message: 'Leave balance created successfully', data: created }
  } catch (error: any) {
    console.error('Error upserting leave balance:', error)
    return {
      success: false,
      message: 'Failed to upsert leave balance',
      error: error?.message,
    }
  }
}

