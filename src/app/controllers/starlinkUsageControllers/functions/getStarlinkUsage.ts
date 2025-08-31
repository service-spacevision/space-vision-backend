import { db } from '../../../db/connection'
import { starlinkUsage } from '../../../models/StarlinkUsage'
import { eq, and } from 'drizzle-orm'

interface GetStarlinkUsageParams {
  reqObject: {
    user: any
  }
  query?: {
    dateKey?: string
    kitNumber?: string
    vesselName?: string
  }
}

export async function getStarlinkUsage_func({ reqObject, query }: GetStarlinkUsageParams) {
  try {
    let queryBuilder = db.select().from(starlinkUsage)

    const conditions = []
    if (query?.dateKey) {
      conditions.push(eq(starlinkUsage.dateKey, query.dateKey))
    }
    if (query?.kitNumber) {
      conditions.push(eq(starlinkUsage.kitNumber, query.kitNumber))
    }
    if (query?.vesselName) {
      conditions.push(eq(starlinkUsage.vesselName, query.vesselName))
    }

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions))
    }

    const result = await queryBuilder

    return {
      success: true,
      data: result,
      message: 'Starlink usage retrieved successfully'
    }
  } catch (error: any) {
    console.error('Error fetching starlink usage:', error)
    return {
      success: false,
      message: 'Failed to fetch starlink usage',
      error: error.message
    }
  }
}