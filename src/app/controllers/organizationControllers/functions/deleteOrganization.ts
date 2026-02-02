import { db } from '../../../db/connection'
import { organizations } from '../../../models/Organization'
import { eq } from 'drizzle-orm'

interface Params { name: string }

export async function deleteOrganization_func({ name }: Params) {
  try {
    await db.delete(organizations).where(eq(organizations.name, name))
    return { success: true, message: 'Organization deleted successfully' }
  } catch (error) {
    console.error('Error deleting organization:', error)
    return { success: false, message: 'Failed to delete organization' }
  }
}

