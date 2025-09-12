import { db } from '../../../db/connection'
import { organizations } from '../../../models/Organization'
import { eq } from 'drizzle-orm'

interface Params { name: string }

export async function getOrganizationByName_func({ name }: Params) {
  try {
    const [row] = await db.select().from(organizations).where(eq(organizations.name, name))
    if (!row) return { success: false, message: 'Organization not found' }
    return { success: true, data: row }
  } catch (error) {
    console.error('Error fetching organization by name:', error)
    return { success: false, message: 'Failed to fetch organization' }
  }
}

