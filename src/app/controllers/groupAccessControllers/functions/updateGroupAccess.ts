import { db } from '../../../db/connection'
import { userRoles } from '../../../models/UserRole'
import { eq } from 'drizzle-orm'
import { users } from '../../../models/User'

interface UpdateGroupAccessParams {
  reqObject: {
    user: any
  }
  query: {
    role: string
  }
  data: {
    groupIds: number[]
  }
}

export async function updateGroupAccess_func({ reqObject, query, data }: UpdateGroupAccessParams) {
  try {
    const { user } = reqObject;
    const { role } = query;
    const { groupIds } = data;

    // Get the user with their role
    const userWithRole = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, user.id),
      with: {
        role: true
      }
    });

    // Check if user has admin role
    if (!userWithRole?.role || userWithRole.role.name !== 'admin') {
      return {
        success: false,
        message: 'Unauthorized: Only admin users can update group access',
      };
    }

    if (!role) {
      return {
        success: false,
        message: 'Role is required',
      };
    }

    const roleId = parseInt(role);
    if (isNaN(roleId)) {
      return {
        success: false,
        message: 'Invalid role ID',
      };
    }

    // Update the forbidden_vessel_groups array for the role
    await db
      .update(userRoles)
      .set({ 
        forbiddenVesselGroups: groupIds,
        updatedAt: new Date() 
      })
      .where(eq(userRoles.id, roleId));

    return {
      success: true,
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