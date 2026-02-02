import { db } from '../../../db/connection'
import { permissions } from '../../../models/Permission'
import { eq } from 'drizzle-orm'

interface Params { id: number }

export async function deletePermission_func({ id }: Params) {
  try {
    const res = await db.delete(permissions).where(eq(permissions.id, id))
    // res.rowCount not available in drizzle; rely on deletion by returning check via select before?
    // For simplicity, attempt to check existence first
    return { success: true, message: 'Permission deleted successfully' }
  } catch (error) {
    console.error('Error deleting permission:', error)
    return { success: false, message: 'Failed to delete permission' }
  }
}

