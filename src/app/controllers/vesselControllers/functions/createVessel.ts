import { db } from '../../../db/connection'
import { vessels, vesselGroups } from '../../../db/schema'
import { eq } from 'drizzle-orm'

interface CreateVesselParams {
  reqObject: {
    user: any
  }
  data: {
    vesselsKitNumber: string
    name?: string
    subscriptionPlan?: string
    groupId?: number
    deviceId?: string
  }
}

export async function createVessel_func({ reqObject, data }: CreateVesselParams) {
  try {
    // Validate required fields
    if (!data.vesselsKitNumber) {
      return {
        success: false,
        message: 'Vessel kit number is required'
      }
    }

    // Check if vessel kit number already exists
    const existingVessel = await db
      .select()
      .from(vessels)
      .where(eq(vessels.vesselsKitNumber, data.vesselsKitNumber))
      .limit(1)

    if (existingVessel.length > 0) {
      return {
        success: false,
        message: 'Vessel with this kit number already exists'
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

    // Create the vessel
    const newVessel = await db
      .insert(vessels)
      .values({
        vesselsKitNumber: data.vesselsKitNumber,
        name: data.name,
        subscriptionPlan: data.subscriptionPlan,
        groupId: data.groupId,
        deviceId: data.deviceId
      })
      .returning()

    return {
      success: true,
      message: 'Vessel created successfully',
      data: newVessel[0]
    }
  } catch (error) {
    console.error('Error in createVessel_func:', error)
    return {
      success: false,
      message: 'Failed to create vessel',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}