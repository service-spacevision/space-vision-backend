import { db } from '../../../db/connection'
import { vessels } from '../../../models/Vessel'
import { eq } from 'drizzle-orm'

interface DeleteVesselParams {
  reqObject: {
    user: any
  }
  query: {
    vesselsKitNumber: string
  }
}

export async function deleteVessel_func({ reqObject, query }: DeleteVesselParams) {
  try {
    if (!query.vesselsKitNumber) {
      return {
        success: false,
        message: 'Vessel kit number is required'
      }
    }

    const result = await db
      .delete(vessels)
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
      message: 'Vessel deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting vessel:', error)
    return {
      success: false,
      message: 'Failed to delete vessel',
      error: error.message
    }
  }
}