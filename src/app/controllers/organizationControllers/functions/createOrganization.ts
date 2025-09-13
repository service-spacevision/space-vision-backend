import { db } from '../../../db/connection'
import { NewOrganization, organizations } from '../../../models/Organization'

interface Params { data: NewOrganization }

export async function createOrganization_func({ data }: Params) {
  try {
    const [created] = await db.insert(organizations).values(data).returning()
    return { success: true, message: 'Organization created successfully', data: created }
  } catch (error: any) {
    if (error?.code === '23505') {
      return { success: false, message: 'Organization name already exists' }
    }
    console.error('Error creating organization:', error)
    return { success: false, message: 'Failed to create organization' }
  }
}

