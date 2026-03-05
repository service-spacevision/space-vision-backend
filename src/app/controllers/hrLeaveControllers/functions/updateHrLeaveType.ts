import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrLeaveTypes, NewHrLeaveType } from '../../../models/HrLeaveType'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  id: number
  data: Partial<NewHrLeaveType>
}

export async function updateHrLeaveType_func({ reqObject, id, data }: Params) {
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

    const hasCodeField = Object.prototype.hasOwnProperty.call(data, 'code')
    if (hasCodeField && (data as any).code === null) {
      return { success: false, message: 'Leave type code cannot be null' }
    }

    const nextCode = typeof data.code === 'string' ? data.code.trim().toUpperCase() : undefined
    if (typeof data.code === 'string' && !nextCode) {
      return { success: false, message: 'Leave type code cannot be empty' }
    }

    if (typeof data.displayName === 'string' && !data.displayName.trim()) {
      return { success: false, message: 'Leave type name cannot be empty' }
    }

    if (nextCode && nextCode !== existing.code) {
      const [duplicate] = await db
        .select({ id: hrLeaveTypes.id })
        .from(hrLeaveTypes)
        .where(
          and(
            eq(hrLeaveTypes.organizationId, orgId),
            eq(hrLeaveTypes.code, nextCode),
          ),
        )
        .limit(1)
      if (duplicate) {
        return { success: false, message: 'Leave type code already exists for this organization' }
      }
    }

    const [updated] = await db
      .update(hrLeaveTypes)
      .set({
        ...(nextCode ? { code: nextCode } : {}),
        ...(typeof data.displayName === 'string'
          ? { displayName: data.displayName.trim() }
          : {}),
        ...(typeof data.isEnabled === 'boolean' ? { isEnabled: data.isEnabled } : {}),
        ...(typeof data.requiresNoticeDays === 'number'
          ? { requiresNoticeDays: data.requiresNoticeDays }
          : {}),
        ...(typeof data.annualAllocationDays === 'number'
          ? { annualAllocationDays: data.annualAllocationDays }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(hrLeaveTypes.id, Number(id)))
      .returning()

    return { success: true, message: 'Leave type updated successfully', data: updated }
  } catch (error: any) {
    console.error('Error updating leave type:', error)
    return {
      success: false,
      message: 'Failed to update leave type',
      error: error?.message,
    }
  }
}
