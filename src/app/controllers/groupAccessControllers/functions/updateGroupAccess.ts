import { db } from '../../../db/connection'
import { groupAccess } from '../../../models/GroupAccess'
import { eq, and } from 'drizzle-orm'

interface UpdateGroupAccessParams {
  reqObject: {
    user: any
  }
  query: {
    role: string
    groupId: string
  }
  data: {
    role?: string
    groupId?: number
  }
}

export async function updateGroupAccess_func({ reqObject, query, data }: UpdateGroupAccessParams) {
  try {
    if (!query.role || !query.groupId) {
      return {
        success: false,
        message: 'Role and group ID are required'
      }
    }

    const updateData = {
      ...data,
      updatedAt: new Date()
    }

    const result = await db
      .update(groupAccess)
      .set(updateData)
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
      message: 'Group access updated successfully'
    }
  } catch (error: any) {
    console.error('Error updating group access:', error)
    return {
      success: false,
      message: 'Failed to update group access',
      error: error.message
    }
  }
}