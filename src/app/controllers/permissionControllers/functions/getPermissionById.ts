import { db } from '../../../db/connection'
import { permissions } from '../../../models/Permission'
import { eq } from 'drizzle-orm'

interface Params { id: number }

export async function getPermissionById_func({ id }: Params) {
  try {
    const [row] = await db.select().from(permissions).where(eq(permissions.id, id))
    if (!row) return { success: false, message: 'Permission not found' }
    return { success: true, data: row }
  } catch (error) {
    console.error('Error fetching permission by id:', error)
    return { success: false, message: 'Failed to fetch permission' }
  }
}

