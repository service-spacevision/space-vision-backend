import { db } from '../../../db/connection'
import { telephonyDids } from '../../../models/TelephonyDid'
import { eq, and, count, desc, SQL } from 'drizzle-orm'
import { IPagination } from '../../../utils/types'

interface GetTelephonyDidsParams {
  reqObject: {
    user: any
  }
  query?: {
    number?: string
    blocked?: boolean
    terminated?: boolean
  }
  pagination?: IPagination
}

export async function getTelephonyDids_func({ reqObject, query, pagination }: GetTelephonyDidsParams) {
  try {
    const conditions: SQL[] = []
    if (query?.number) {
      conditions.push(eq(telephonyDids.number, query.number))
    }
    if (query?.blocked !== undefined) {
      conditions.push(eq(telephonyDids.blocked, query.blocked))
    }
    if (query?.terminated !== undefined) {
      conditions.push(eq(telephonyDids.terminated, query.terminated))
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    // If pagination.all is set, return all records without pagination
    if (pagination?.all === 'true' || pagination?.all === '1') {
      const result = await db.select()
        .from(telephonyDids)
        .where(whereCondition)
        .orderBy(desc(telephonyDids.createdAt))

      return {
        success: true,
        message: 'Telephony DIDs retrieved successfully',
        data: result,
        pagination: {
          total: result.length,
          page: 1,
          pageSize: result.length
        }
      }
    }

    // Default pagination values
    const page = pagination?.currentPage || 1
    const pageSize = pagination?.pageSize || 10
    const offset = (page - 1) * pageSize

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(telephonyDids)
      .where(whereCondition)

    const total = totalResult.count

    // Get paginated data
    const result = await db.select()
      .from(telephonyDids)
      .where(whereCondition)
      .orderBy(desc(telephonyDids.createdAt))
      .limit(pageSize)
      .offset(offset)

    return {
      success: true,
      message: 'Telephony DIDs retrieved successfully',
      data: result,
      pagination: {
        total,
        page,
        pageSize
      }
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