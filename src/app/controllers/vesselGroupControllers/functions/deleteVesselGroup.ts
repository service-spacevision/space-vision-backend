import { db } from '../../../db/connection'
import { vesselGroups } from '../../../models/VesselGroup'
import { eq } from 'drizzle-orm'

interface DeleteVesselGroupParams {
  reqObject: {
    user: any
  }
  query: {
    groupName: string
  }
}

export async function deleteVesselGroup_func({ reqObject, query }: DeleteVesselGroupParams) {
  try {
    if (!query.groupName) {
      return {
        success: false,
        message: 'Group name is required'
      }
    }

    const result = await db
      .delete(vesselGroups)
      .where(eq(vesselGroups.groupName, query.groupName))
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
      message: 'Vessel group deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting vessel group:', error)
    return {
      success: false,
      message: 'Failed to delete vessel group',
      error: error.message
    }
  }
}