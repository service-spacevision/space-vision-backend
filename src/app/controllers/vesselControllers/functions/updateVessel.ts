import { db } from '../../../db/connection'
import { vessels, vesselGroups } from '../../../db/schema'
import { eq, and, ne } from 'drizzle-orm'

interface UpdateVesselParams {
  reqObject: {
    user: any
  }
  query: {
    id: string
  }
  data: {
    vesselsKitNumber?: string
    name?: string
    subscriptionPlan?: string
    groupId?: number
    deviceId?: string
  }
}

export async function updateVessel_func({ reqObject, query, data }: UpdateVesselParams) {
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

    // Check if vessel kit number already exists (excluding current vessel)
    if (data.vesselsKitNumber) {
      const duplicateVessel = await db
        .select()
        .from(vessels)
        .where(
          and(
            eq(vessels.vesselsKitNumber, data.vesselsKitNumber),
            ne(vessels.id, vesselId)
          )
        )
        .limit(1)

      if (duplicateVessel.length > 0) {
        return {
          success: false,
          message: 'Vessel with this kit number already exists'
        }
      }
    }

    // Validate group exists if groupId is provided
    if (data.groupId) {
      const existingGroup = await db
        .select()
        .from(vesselGroups)
        .where(eq(vesselGroups.id, data.groupId))
        .limit(1)

      if (existingGroup.length === 0) {
        return {
          success: false,
          message: 'Vessel group not found'
        }
      }
    }

    // Update the vessel
    const updatedVessel = await db
      .update(vessels)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(vessels.id, vesselId))
      .returning()

    return {
      success: true,
      message: 'Vessel updated successfully',
      data: updatedVessel[0]
    }
  } catch (error) {
    console.error('Error in updateVessel_func:', error)
    return {
      success: false,
      message: 'Failed to update vessel',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}