import { db } from '../../../db/connection'
import { vessels } from '../../../models/Vessel'
import { eq } from 'drizzle-orm'

interface ToggleVesselStatusParams {
  reqObject: {
    user: any
  }
  query: {
    id: string
  }
}

export async function toggleVesselStatus_func({ reqObject, query }: ToggleVesselStatusParams) {
  try {
    const vesselId = parseInt(query.id)

    if (!vesselId) {
      return {
        success: false,
        message: 'Vessel ID is required'
      }
    }

    // Check if vessel exists
    const existingVessel = await db
      .select()
      .from(vessels)
      .where(eq(vessels.id, vesselId))
      .limit(1)

    if (existingVessel.length === 0) {
      return {
        success: false,
        message: 'Vessel not found'
      }
    }

    // Toggle the isActive status
    const currentStatus = existingVessel[0].isActive
    const newStatus = !currentStatus

    // Update the vessel
    const updatedVessel = await db
      .update(vessels)
      .set({
        isActive: newStatus,
        updatedAt: new Date()
      })
      .where(eq(vessels.id, vesselId))
      .returning()

    return {
      success: true,
      message: `Vessel ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: updatedVessel[0]
    }
  } catch (error) {
    console.error('Error in toggleVesselStatus_func:', error)
    return {
      success: false,
      message: 'Failed to toggle vessel status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
