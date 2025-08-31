import { db } from '../../../db/connection'
import { groupAccess } from '../../../models/GroupAccess'
import { eq, and } from 'drizzle-orm'

interface GetGroupAccessParams {
  reqObject: {
    user: any
  }
  query?: {
    role?: string
    groupName?: string
  }
}

export async function getGroupAccess_func({ reqObject, query }: GetGroupAccessParams) {
  try {
    let queryBuilder = db.select().from(groupAccess)

    const conditions = []
    if (query?.role) {
      conditions.push(eq(groupAccess.role, query.role))
    }
    if (query?.groupName) {
      conditions.push(eq(groupAccess.groupName, query.groupName))
    }

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions))
    }

    const result = await queryBuilder

    return {
      success: true,
      data: result,
      message: 'Group access retrieved successfully'
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