import { db } from '../../../db/connection'
import { mikrotikVessels, NewMikrotikVessel } from '../../../models/MikrotikVessel'

interface CreateMikrotikVesselParams {
  reqObject: {
    user: any
  }
  data: NewMikrotikVessel
}

export async function createMikrotikVessel_func({ reqObject, data }: CreateMikrotikVesselParams) {
  try {
    const result = await db.insert(mikrotikVessels).values(data).returning()

    return {
      success: true,
      data: result[0],
      message: 'Mikrotik vessel created successfully'
    }
  } catch (error: any) {
    console.error('Error creating mikrotik vessel:', error)
    return {
      success: false,
      message: 'Failed to create mikrotik vessel',
      error: error.message
    }
  }
}