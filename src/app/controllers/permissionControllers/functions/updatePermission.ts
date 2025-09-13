import { db } from '../../../db/connection'
import { permissions, UpdatePermissionData } from '../../../models/Permission'
import { eq } from 'drizzle-orm'

interface Params { id: number; data: UpdatePermissionData }

export async function updatePermission_func({ id, data }: Params) {
  try {
    const [updated] = await db.update(permissions)
      .set({
        resource: data.resource,
        action: data.action,
        scope: data.scope as any,
        category: data.category as any,
        description: data.description
      })
      .where(eq(permissions.id, id))
      .returning()

    if (!updated) return { success: false, message: 'Permission not found' }

    return { success: true, message: 'Permission updated successfully', data: updated }
  } catch (error) {
    console.error('Error updating permission:', error)
    return { success: false, message: 'Failed to update permission' }
  }
}

