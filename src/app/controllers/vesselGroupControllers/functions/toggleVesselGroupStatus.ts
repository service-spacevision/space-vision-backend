import { db } from '../../../db/connection'
import { vesselGroups } from '../../../models/VesselGroup'
import { eq } from 'drizzle-orm'

interface ToggleVesselGroupStatusParams {
  reqObject: {
    user: any
  }
  query: {
    id: number
  }
}

export async function toggleVesselGroupStatus_func({ reqObject, query }: ToggleVesselGroupStatusParams) {
  try {
    if (!query.id) {
      return {
        success: false,
        message: 'Group id is required'
      }
    }

    // Check if vessel group exists
    const existingGroup = await db
      .select()
      .from(vesselGroups)
      .where(eq(vesselGroups.id, query.id))
      .limit(1)

    if (existingGroup.length === 0) {
      return {
        success: false,
        message: 'Vessel group not found'
      }
    }

    // Toggle the isActive status
    const currentStatus = existingGroup[0].isActive
    const newStatus = !currentStatus

    // Update the vessel group
    const updatedGroup = await db
      .update(vesselGroups)
      .set({
        isActive: newStatus,
        updatedAt: new Date()
      })
      .where(eq(vesselGroups.id, query.id))
      .returning()

    return {
      success: true,
      message: `Vessel group ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: updatedGroup[0]
    }
  } catch (error: any) {
    console.error('Error in toggleVesselGroupStatus_func:', error)
    return {
      success: false,
      message: 'Failed to toggle vessel group status',
      error: error.message
    }
  }
}
