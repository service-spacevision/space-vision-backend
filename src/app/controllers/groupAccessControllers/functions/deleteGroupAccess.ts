import { db } from '../../../db/connection'
import { groupAccess } from '../../../models/GroupAccess'
import { eq, and } from 'drizzle-orm'

interface DeleteGroupAccessParams {
  reqObject: {
    user: any
  }
  query: {
    role: string
    groupId: string
  }
}

export async function deleteGroupAccess_func({ reqObject, query }: DeleteGroupAccessParams) {
  try {
    if (!query.role || !query.groupId) {
      return {
        success: false,
        message: 'Role and group ID are required'
      }
    }

    const result = await db
      .delete(groupAccess)
      .where(and(
        eq(groupAccess.role, query.role),
        eq(groupAccess.groupId, parseInt(query.groupId))
      ))
      .returning()

    if (result.length === 0) {
      return {
        success: false,
        message: 'Group access not found'
      }
    }

    return {
      success: true,
      data: result[0],
      message: 'Group access deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting group access:', error)
    return {
      success: false,
      message: 'Failed to delete group access',
      error: error.message
    }
  }
}