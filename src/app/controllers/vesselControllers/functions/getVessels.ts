import { db } from '../../../db/connection'
import { vessels } from '../../../models/Vessel'
import { eq, and, count, desc, SQL } from 'drizzle-orm'
import { IPagination } from '../../../utils/types'

interface GetVesselsParams {
  reqObject: {
    user: any
  }
  query?: {
    vesselsKitNumber?: string
    groupId?: string
  }
  pagination?: IPagination
}

export async function getVessels_func({ reqObject, query, pagination }: GetVesselsParams) {
  try {
    const conditions: SQL[] = []
    if (query?.vesselsKitNumber) {
      conditions.push(eq(vessels.vesselsKitNumber, query.vesselsKitNumber))
    }
    if (query?.groupId) {
      conditions.push(eq(vessels.groupId, parseInt(query.groupId)))
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    // If pagination.all is set, return all records without pagination
    if (pagination?.all === 'true' || pagination?.all === '1') {
      const result = await db.select()
        .from(vessels)
        .where(whereCondition)
        .orderBy(desc(vessels.createdAt))

      return {
        success: true,
        message: 'Vessels retrieved successfully',
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
      .from(vessels)
      .where(whereCondition)

    const total = totalResult.count

    // Get paginated data
    const result = await db.select()
      .from(vessels)
      .where(whereCondition)
      .orderBy(desc(vessels.createdAt))
      .limit(pageSize)
      .offset(offset)

    return {
      success: true,
      message: 'Vessels retrieved successfully',
      data: result,
      pagination: {
        total,
        page,
        pageSize
      }
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