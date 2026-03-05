import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrLeaveTypes, NewHrLeaveType } from '../../../models/HrLeaveType'
import { organizations } from '../../../models/Organization'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  data: Partial<NewHrLeaveType>
}

export async function createHrLeaveType_func({ reqObject, data }: Params) {
  try {
    const organizationId = Number(data.organizationId || reqObject.user.organizationId)
    if (!organizationId) {
      return { success: false, message: 'Organization not found for user' }
    }

    if (Object.prototype.hasOwnProperty.call(data, 'code') && (data as any).code === null) {
      return { success: false, message: 'Leave type code cannot be null' }
    }
    if (Object.prototype.hasOwnProperty.call(data, 'displayName') && (data as any).displayName === null) {
      return { success: false, message: 'Leave type name cannot be null' }
    }

    const code = String(data.code || '').trim().toUpperCase()
    const displayName = String(data.displayName || '').trim()
    if (!code) return { success: false, message: 'Leave type code is required' }
    if (!displayName) return { success: false, message: 'Leave type name is required' }

    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1)
    if (!org) return { success: false, message: 'Organization not found' }

    const [existing] = await db
      .select({ id: hrLeaveTypes.id })
      .from(hrLeaveTypes)
      .where(
        and(
          eq(hrLeaveTypes.organizationId, organizationId),
          eq(hrLeaveTypes.code, code),
        ),
      )
      .limit(1)
    if (existing) {
      return { success: false, message: 'Leave type code already exists for this organization' }
    }

    const [created] = await db
      .insert(hrLeaveTypes)
      .values({
        organizationId,
        code,
        displayName,
        isEnabled: data.isEnabled ?? true,
        requiresNoticeDays: data.requiresNoticeDays,
        annualAllocationDays: data.annualAllocationDays,
      })
      .returning()

    return {
      success: true,
      message: 'Leave type created successfully',
      data: created,
    }
  } catch (error: any) {
    if (error?.code === '23505') {
      return { success: false, message: 'Leave type code already exists for this organization' }
    }
    console.error('Error creating leave type:', error)
    return {
      success: false,
      message: 'Failed to create leave type',
      error: error?.message,
    }
  }
}
