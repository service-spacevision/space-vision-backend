import { db } from '../../../db/connection'
import { mikrotikVessels } from '../../../models/MikrotikVessel'
import { eq } from 'drizzle-orm'

interface UpdateMikrotikVesselParams {
  reqObject: {
    user: any
  }
  query: {
    vesselName: string
  }
  data: {
    routerIp?: string
    apiPort?: number
  }
}

export async function updateMikrotikVessel_func({ reqObject, query, data }: UpdateMikrotikVesselParams) {
  try {
    if (!query.vesselName) {
      return {
        success: false,
        message: 'Vessel name is required'
      }
    }

    const updateData = {
      ...data,
      updatedAt: new Date()
    }

    const result = await db
      .update(mikrotikVessels)
      .set(updateData)
      .where(eq(mikrotikVessels.vesselName, query.vesselName))
      .returning()

    if (result.length === 0) {
      return {
        success: false,
        message: 'Mikrotik vessel not found'
      }
    }

    return {
      success: true,
      data: result[0],
      message: 'Mikrotik vessel updated successfully'
    }
  } catch (error: any) {
    console.error('Error updating mikrotik vessel:', error)
    return {
      success: false,
      message: 'Failed to update mikrotik vessel',
      error: error.message
    }
  }
}