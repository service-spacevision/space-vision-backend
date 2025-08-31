import { db } from '../../../db/connection'
import { mikrotikVessels } from '../../../models/MikrotikVessel'
import { eq } from 'drizzle-orm'

interface DeleteMikrotikVesselParams {
  reqObject: {
    user: any
  }
  query: {
    vesselName: string
  }
}

export async function deleteMikrotikVessel_func({ reqObject, query }: DeleteMikrotikVesselParams) {
  try {
    if (!query.vesselName) {
      return {
        success: false,
        message: 'Vessel name is required'
      }
    }

    const result = await db
      .delete(mikrotikVessels)
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
      message: 'Mikrotik vessel deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting mikrotik vessel:', error)
    return {
      success: false,
      message: 'Failed to delete mikrotik vessel',
      error: error.message
    }
  }
}