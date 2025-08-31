import { db } from '../../../db/connection'
import { vessels, NewVessel } from '../../../models/Vessel'

interface CreateVesselParams {
  reqObject: {
    user: any
  }
  data: NewVessel
}

export async function createVessel_func({ reqObject, data }: CreateVesselParams) {
  try {
    const result = await db.insert(vessels).values(data).returning()

    return {
      success: true,
      data: result[0],
      message: 'Vessel created successfully'
    }
  } catch (error: any) {
    console.error('Error creating vessel:', error)
    return {
      success: false,
      message: 'Failed to create vessel',
      error: error.message
    }
  }
}