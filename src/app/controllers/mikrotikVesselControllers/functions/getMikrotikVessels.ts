import { db } from '../../../db/connection'
import { mikrotikVessels } from '../../../models/MikrotikVessel'
import { eq } from 'drizzle-orm'

interface GetMikrotikVesselsParams {
  reqObject: {
    user: any
  }
  query?: {
    vesselName?: string
    routerIp?: string
  }
}

export async function getMikrotikVessels_func({ reqObject, query }: GetMikrotikVesselsParams) {
  try {
    let queryBuilder = db.select().from(mikrotikVessels)

    if (query?.vesselName) {
      queryBuilder = queryBuilder.where(eq(mikrotikVessels.vesselName, query.vesselName))
    }

    if (query?.routerIp) {
      queryBuilder = queryBuilder.where(eq(mikrotikVessels.routerIp, query.routerIp))
    }

    const result = await queryBuilder

    return {
      success: true,
      data: result,
      message: 'Mikrotik vessels retrieved successfully'
    }
  } catch (error: any) {
    console.error('Error fetching mikrotik vessels:', error)
    return {
      success: false,
      message: 'Failed to fetch mikrotik vessels',
      error: error.message
    }
  }
}