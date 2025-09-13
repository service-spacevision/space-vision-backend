import { db } from '../../../db/connection'
import { userRoles } from '../../../models/UserRole'
import { CreateUserRoleData } from '../../../models/UserRole'

interface CreateUserRoleParams {
  data: CreateUserRoleData
}

export async function createUserRole_func({ data }: CreateUserRoleParams) {
  try {
    const [newRole] = await db.insert(userRoles).values({
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      created_by: (data as any).createdBy?.toString?.() ?? (data as any).created_by,
      organizationName: (data as any).organizationName,
    }).returning()

    return {
      success: true,
      message: 'User role created successfully',
      data: newRole
    }
  } catch (error: any) {
    console.error('Error creating user role:', error)
    
    if (error.code === '23505') { // Unique constraint violation
      return {
        success: false,
        message: 'Role name already exists'
      }
    }

    return {
      success: false,
      message: 'Failed to create user role'
    }
  }
}
