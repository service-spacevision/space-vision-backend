import { db } from '../../../db/connection'
import { mikrotikVessels } from '../../../models/MikrotikVessel'
import { eq, and, count, desc, SQL } from 'drizzle-orm'
import { IPagination } from '../../../utils/types'

interface GetMikrotikVesselsParams {
  reqObject: {
    user: any
  }
  query?: {
    vesselName?: string
    routerIp?: string
  }
  pagination?: IPagination
}

export async function getMikrotikVessels_func({ reqObject, query, pagination }: GetMikrotikVesselsParams) {
  try {
    const conditions: SQL[] = []
    if (query?.vesselName) {
      conditions.push(eq(mikrotikVessels.vesselName, query.vesselName))
    }
    if (query?.routerIp) {
      conditions.push(eq(mikrotikVessels.routerIp, query.routerIp))
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    // If pagination.all is set, return all records without pagination
    if (pagination?.all === 'true' || pagination?.all === '1') {
      const result = await db.select()
        .from(mikrotikVessels)
        .where(whereCondition)
        .orderBy(desc(mikrotikVessels.createdAt))

      return {
        success: true,
        message: 'Mikrotik vessels retrieved successfully',
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
      .from(mikrotikVessels)
      .where(whereCondition)

    const total = totalResult.count

    // Get paginated data
    const result = await db.select()
      .from(mikrotikVessels)
      .where(whereCondition)
      .orderBy(desc(mikrotikVessels.createdAt))
      .limit(pageSize)
      .offset(offset)

    return {
      success: true,
      message: 'Mikrotik vessels retrieved successfully',
      data: result,
      pagination: {
        total,
        page,
        pageSize
      }
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