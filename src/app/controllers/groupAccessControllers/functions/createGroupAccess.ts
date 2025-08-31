import { db } from '../../../db/connection'
import { groupAccess, NewGroupAccess } from '../../../models/GroupAccess'

interface CreateGroupAccessParams {
  reqObject: {
    user: any
  }
  data: NewGroupAccess
}

export async function createGroupAccess_func({ reqObject, data }: CreateGroupAccessParams) {
  try {
    const result = await db.insert(groupAccess).values(data).returning()

    return {
      success: true,
      data: result[0],
      message: 'Group access created successfully'
    }
  } catch (error: any) {
    console.error('Error creating group access:', error)
    return {
      success: false,
      message: 'Failed to create group access',
      error: error.message
    }
  }
}