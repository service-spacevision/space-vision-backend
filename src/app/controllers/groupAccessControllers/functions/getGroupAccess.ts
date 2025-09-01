import { db } from '../../../db/connection'
import { groupAccess } from '../../../models/GroupAccess'
import { eq, and, count, desc, SQL } from 'drizzle-orm'
import { IPagination } from '../../../utils/types'

interface GetGroupAccessParams {
  reqObject: {
    user: any
  }
  query?: {
    role?: string
    groupId?: string
  }
  pagination?: IPagination
}

export async function getGroupAccess_func({ reqObject, query, pagination }: GetGroupAccessParams) {
  try {
    const conditions: SQL[] = []
    if (query?.role) {
      conditions.push(eq(groupAccess.role, query.role))
    }
    if (query?.groupId) {
      conditions.push(eq(groupAccess.groupId, parseInt(query.groupId)))
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    // If pagination.all is set, return all records without pagination
    if (pagination?.all === 'true' || pagination?.all === '1') {
      const result = await db.select()
        .from(groupAccess)
        .where(whereCondition)
        .orderBy(desc(groupAccess.createdAt))

      return {
        success: true,
        message: 'Group access retrieved successfully',
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
      .from(groupAccess)
      .where(whereCondition)

    const total = totalResult.count

    // Get paginated data
    const result = await db.select()
      .from(groupAccess)
      .where(whereCondition)
      .orderBy(desc(groupAccess.createdAt))
      .limit(pageSize)
      .offset(offset)

    return {
      success: true,
      message: 'Group access retrieved successfully',
      data: result,
      pagination: {
        total,
        page,
        pageSize
      }
    }
  } catch (error: any) {
    console.error('Error fetching group access:', error)
    return {
      success: false,
      message: 'Failed to fetch group access',
      error: error.message
    }
  }
}