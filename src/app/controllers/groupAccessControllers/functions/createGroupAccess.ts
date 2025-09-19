import { db } from '../../../db/connection'
import { userRoles } from '../../../models/UserRole'

interface CreateGroupAccessParams {
  reqObject: {
    user: any
  }
  data: {
    role: number;
    groupIds: number[];
  }
}

export async function createGroupAccess_func({ reqObject, data }: CreateGroupAccessParams) {
  try {
    // In the new structure, we don't need to create a new record
    // as we're just updating the permitted_vessel_groups array in the user_roles table
    // This function is kept for backward compatibility but will just return success
    
    return {
      success: true,
      message: 'Group access is now managed through role permissions. Use updateGroupAccess to modify forbidden vessel groups.'
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