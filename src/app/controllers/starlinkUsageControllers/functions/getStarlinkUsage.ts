import { db } from '../../../db/connection'
import { starlinkUsage } from '../../../models/StarlinkUsage'
import { eq, and, count, desc, SQL } from 'drizzle-orm'
import { IPagination } from '../../../utils/types'

interface GetStarlinkUsageParams {
  reqObject: {
    user: any
  }
  query?: {
    dateKey?: string
    kitNumber?: string
    vesselName?: string
  }
  pagination?: IPagination
}

export async function getStarlinkUsage_func({ reqObject, query, pagination }: GetStarlinkUsageParams) {
  try {
    const conditions: SQL[] = []
    if (query?.dateKey) {
      conditions.push(eq(starlinkUsage.dateKey, query.dateKey))
    }
    if (query?.kitNumber) {
      conditions.push(eq(starlinkUsage.kitNumber, query.kitNumber))
    }
    if (query?.vesselName) {
      conditions.push(eq(starlinkUsage.vesselName, query.vesselName))
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    // If pagination.all is set, return all records without pagination
    if (pagination?.all === 'true' || pagination?.all === '1') {
      const result = await db.select()
        .from(starlinkUsage)
        .where(whereCondition)
        .orderBy(desc(starlinkUsage.createdAt))

      return {
        success: true,
        message: 'Starlink usage retrieved successfully',
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
      .from(starlinkUsage)
      .where(whereCondition)

    const total = totalResult.count

    // Get paginated data
    const result = await db.select()
      .from(starlinkUsage)
      .where(whereCondition)
      .orderBy(desc(starlinkUsage.createdAt))
      .limit(pageSize)
      .offset(offset)

    return {
      success: true,
      message: 'Starlink usage retrieved successfully',
      data: result,
      pagination: {
        total,
        page,
        pageSize
      }
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