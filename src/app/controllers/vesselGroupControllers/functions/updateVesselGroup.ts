import { db } from '../../../db/connection'
import { vesselGroups } from '../../../models/VesselGroup'
import { eq } from 'drizzle-orm'

interface UpdateVesselGroupParams {
  reqObject: {
    user: any
  }
  query: {
    id: number
  }
  data: {
    groupName?: string
  }
}

export async function updateVesselGroup_func({ reqObject, query, data }: UpdateVesselGroupParams) {
  try {
    if (!query.id) {
      return {
        success: false,
        message: 'Group id is required'
      }
    }

    const updateData = {
      ...data,
      updatedAt: new Date()
    }

    const result = await db
      .update(vesselGroups)
      .set(updateData)
      .where(eq(vesselGroups.id, query.id))
      .returning()

    if (result.length === 0) {
      return {
        success: false,
        message: 'Vessel group not found'
      }
    }

    return {
      success: true,
      data: result[0],
      message: 'Vessel group updated successfully'
    }
  } catch (error: any) {
    console.error('Error updating vessel group:', error)
    return {
      success: false,
      message: 'Failed to update vessel group',
      error: error.message
    }
  }
}