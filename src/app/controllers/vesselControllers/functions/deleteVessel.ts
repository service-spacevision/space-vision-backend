import { db } from '../../../db/connection'
import { vessels } from '../../../db/schema'
import { eq } from 'drizzle-orm'

interface DeleteVesselParams {
  reqObject: {
    user: any
  }
  query: {
    id: string
  }
}

export async function deleteVessel_func({ reqObject, query }: DeleteVesselParams) {
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

    // Delete the vessel
    await db
      .delete(vessels)
      .where(eq(vessels.id, vesselId))

    return {
      success: true,
      message: 'Vessel deleted successfully',
      data: existingVessel[0]
    }
  } catch (error) {
    console.error('Error in deleteVessel_func:', error)
    return {
      success: false,
      message: 'Failed to delete vessel',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}