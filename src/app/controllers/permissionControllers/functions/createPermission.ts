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
      description: data.description
    }).returning()

    return { success: true, message: 'Permission created successfully', data: created }
  } catch (error: any) {
    if (error?.code === '23505') {
      return { success: false, message: 'Permission name already exists' }
    }
    console.error('Error creating permission:', error)
    return { success: false, message: 'Failed to create permission' }
  }
}

