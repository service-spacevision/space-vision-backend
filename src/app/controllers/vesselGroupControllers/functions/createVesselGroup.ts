import { db } from '../../../db/connection'
import { vesselGroups, NewVesselGroup } from '../../../models/VesselGroup'

interface CreateVesselGroupParams {
  reqObject: {
    user: any
  }
  data: NewVesselGroup
}

export async function createVesselGroup_func({ reqObject, data }: CreateVesselGroupParams) {
  try {
    const result = await db.insert(vesselGroups).values(data).returning()

    return {
      success: true,
      data: result[0],
      message: 'Vessel group created successfully'
    }
  } catch (error: any) {
    console.error('Error creating vessel group:', error)
    return {
      success: false,
      message: 'Failed to create vessel group',
      error: error.message
    }
  }
}