import { db } from '../../../db/connection'
import { vesselGroups } from '../../../models/VesselGroup'
import { eq } from 'drizzle-orm'

interface GetVesselGroupsParams {
  reqObject: {
    user: any
  }
  query?: {
    groupName?: string
  }
}

export async function getVesselGroups_func({ reqObject, query }: GetVesselGroupsParams) {
  try {
    let queryBuilder = db.select().from(vesselGroups)

    if (query?.groupName) {
      queryBuilder = queryBuilder.where(eq(vesselGroups.groupName, query.groupName))
    }

    const result = await queryBuilder

    return {
      success: true,
      data: result,
      message: 'Vessel groups retrieved successfully'
    }
  } catch (error: any) {
    console.error('Error fetching vessel groups:', error)
    return {
      success: false,
      message: 'Failed to fetch vessel groups',
      error: error.message
    }
  }
}