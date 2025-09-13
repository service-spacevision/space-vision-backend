import { db } from '../../../db/connection'
import { organizations } from '../../../models/Organization'
import { eq } from 'drizzle-orm'

interface Params { name: string; data: Partial<{ description: string; logo: string; subscription_id: string; parent_org_name: string }> }

export async function updateOrganization_func({ name, data }: Params) {
  try {
    const [updated] = await db.update(organizations)
      .set({
        description: (data as any).description,
        logo: (data as any).logo,
        subscription_id: (data as any).subscription_id,
        parent_org_name: (data as any).parent_org_name,
        updatedAt: new Date()
      })
      .where(eq(organizations.name, name))
      .returning()

    if (!updated) return { success: false, message: 'Organization not found' }
    return { success: true, message: 'Organization updated successfully', data: updated }
  } catch (error) {
    console.error('Error updating organization:', error)
    return { success: false, message: 'Failed to update organization' }
  }
}

