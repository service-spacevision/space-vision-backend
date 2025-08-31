import { db } from '../../../db/connection'
import { vessels } from '../../../models/Vessel'
import { eq } from 'drizzle-orm'

interface UpdateVesselParams {
  reqObject: {
    user: any
  }
  query: {
    vesselsKitNumber: string
  }
  data: Partial<{
    name?: string
    subscriptionPlan?: string
    groupName?: string
    deviceId?: string
  }>
}

export async function updateVessel_func({ reqObject, query, data }: UpdateVesselParams) {
  try {
    if (!query.vesselsKitNumber) {
      return {
        success: false,
        message: 'Vessel kit number is required'
      }
    }

    const updateData = {
      ...data,
      updatedAt: new Date()
    }

    const result = await db
      .update(vessels)
      .set(updateData)
      .where(eq(vessels.vesselsKitNumber, query.vesselsKitNumber))
      .returning()

    if (result.length === 0) {
      return {
        success: false,
        message: 'Vessel not found'
      }
    }

    return {
      success: true,
      data: result[0],
      message: 'Vessel updated successfully'
    }
  } catch (error: any) {
    console.error('Error updating vessel:', error)
    return {
      success: false,
      message: 'Failed to update vessel',
      error: error.message
    }
  }
}