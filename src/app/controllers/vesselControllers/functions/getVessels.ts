import { db } from '../../../db/connection'
import { vessels } from '../../../models/Vessel'
import { eq } from 'drizzle-orm'

interface GetVesselsParams {
  reqObject: {
    user: any
  }
  query?: {
    vesselsKitNumber?: string
    groupName?: string
  }
}

export async function getVessels_func({ reqObject, query }: GetVesselsParams) {
  try {
    let queryBuilder = db.select().from(vessels)

    if (query?.vesselsKitNumber) {
      queryBuilder = queryBuilder.where(eq(vessels.vesselsKitNumber, query.vesselsKitNumber))
    }

    if (query?.groupName) {
      queryBuilder = queryBuilder.where(eq(vessels.groupName, query.groupName))
    }

    const result = await queryBuilder

    return {
      success: true,
      data: result,
      message: 'Vessels retrieved successfully'
    }
  } catch (error: any) {
    console.error('Error fetching vessels:', error)
    return {
      success: false,
      message: 'Failed to fetch vessels',
      error: error.message
    }
  }
}