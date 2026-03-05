import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { NewHrShiftGroup, hrShiftGroups } from '../../../models/HrShiftGroup'
import { organizations } from '../../../models/Organization'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  data: Partial<NewHrShiftGroup>
}

export async function createHrShiftGroup_func({ reqObject, data }: Params) {
  try {
    const organizationId = Number(data.organizationId || reqObject.user.organizationId)
    if (!organizationId) return { success: false, message: 'Organization not found for user' }

    const name = String(data.name || '').trim()
    if (!name) return { success: false, message: 'Shift group name is required' }

    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1)
    if (!org) return { success: false, message: 'Organization not found' }

    const [existing] = await db
      .select({ id: hrShiftGroups.id })
      .from(hrShiftGroups)
      .where(
        and(
          eq(hrShiftGroups.organizationId, organizationId),
          eq(hrShiftGroups.name, name),
        ),
      )
      .limit(1)
    if (existing) {
      return { success: false, message: 'Shift group name already exists for this organization' }
    }

    const [created] = await db
      .insert(hrShiftGroups)
      .values({
        organizationId,
        name,
        isActive: data.isActive ?? true,
      })
      .returning()

    return { success: true, message: 'Shift group created successfully', data: created }
  } catch (error: any) {
    console.error('Error creating shift group:', error)
    return { success: false, message: 'Failed to create shift group', error: error?.message }
  }
}

