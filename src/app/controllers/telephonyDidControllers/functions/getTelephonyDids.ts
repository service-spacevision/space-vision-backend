import { db } from '../../../db/connection'
import { telephonyDids } from '../../../models/TelephonyDid'
import { eq } from 'drizzle-orm'

interface GetTelephonyDidsParams {
  reqObject: {
    user: any
  }
  query?: {
    number?: string
    blocked?: boolean
    terminated?: boolean
  }
}

export async function getTelephonyDids_func({ reqObject, query }: GetTelephonyDidsParams) {
  try {
    let queryBuilder = db.select().from(telephonyDids)

    if (query?.number) {
      queryBuilder = queryBuilder.where(eq(telephonyDids.number, query.number))
    }

    if (query?.blocked !== undefined) {
      queryBuilder = queryBuilder.where(eq(telephonyDids.blocked, query.blocked))
    }

    if (query?.terminated !== undefined) {
      queryBuilder = queryBuilder.where(eq(telephonyDids.terminated, query.terminated))
    }

    const result = await queryBuilder

    return {
      success: true,
      data: result,
      message: 'Telephony DIDs retrieved successfully'
    }
  } catch (error: any) {
    console.error('Error fetching telephony DIDs:', error)
    return {
      success: false,
      message: 'Failed to fetch telephony DIDs',
      error: error.message
    }
  }
}