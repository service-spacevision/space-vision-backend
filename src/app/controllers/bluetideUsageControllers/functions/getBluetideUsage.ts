import { db } from '../../../db/connection'
import { bluetideUsage } from '../../../models/BluetideUsage'
import { eq, and, count, desc, SQL } from 'drizzle-orm'
import { IPagination } from '../../../utils/types'

interface GetBluetideUsageParams {
  reqObject: {
    user: any
  }
  query?: {
    date?: string
    kitp?: string
    name?: string
  }
  pagination?: IPagination
}

export async function getBluetideUsage_func({ reqObject, query, pagination }: GetBluetideUsageParams) {
  try {
    const conditions: SQL[] = []
    if (query?.date) {
      conditions.push(eq(bluetideUsage.date, query.date))
    }
    if (query?.kitp) {
      conditions.push(eq(bluetideUsage.kitp, query.kitp))
    }
    if (query?.name) {
      conditions.push(eq(bluetideUsage.name, query.name))
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    // If pagination.all is set, return all records without pagination
    if (pagination?.all === 'true' || pagination?.all === '1') {
      const result = await db.select()
        .from(bluetideUsage)
        .where(whereCondition)
        .orderBy(desc(bluetideUsage.createdAt))

      return {
        success: true,
        message: 'Bluetide usage retrieved successfully',
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
      .from(bluetideUsage)
      .where(whereCondition)

    const total = totalResult.count

    // Get paginated data
    const result = await db.select()
      .from(bluetideUsage)
      .where(whereCondition)
      .orderBy(desc(bluetideUsage.createdAt))
      .limit(pageSize)
      .offset(offset)

    return {
      success: true,
      message: 'Bluetide usage retrieved successfully',
      data: result,
      pagination: {
        total,
        page,
        pageSize
      }
    }
  } catch (error: any) {
    console.error('Error fetching bluetide usage:', error)
    return {
      success: false,
      message: 'Failed to fetch bluetide usage',
      error: error.message
    }
  }
}