import { db } from '../../../db/connection'
import { CreatePermissionData, permissions } from '../../../models/Permission'

interface Params { data: CreatePermissionData }

export async function createPermission_func({ data }: Params) {
  try {
    const [created] = await db.insert(permissions).values({
      name: data.name,
      resource: data.resource,
      action: data.action,
      scope: (data.scope as any) ?? 'own',
      category: data.category as any,
      section: (data.section as any) ?? 'organization',
      description: data.description
    }).returning()

    return { success: true, message: 'Permission created successfully', data: created }
  } catch (error: any) {
    // Handle various forms of duplicate key errors
    if (error?.code === '23505' ||
      error?.constraint === 'permissions_name_unique' ||
      error?.message?.includes('duplicate key') ||
      error?.message?.includes('already exists')) {
      return { success: false, message: 'Permission name already exists' }
    }
    // Silently handle other errors during permission population
    return { success: false, message: 'Failed to create permission' }
  }
}

