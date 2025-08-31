import { db } from '../../../db/connection'
import { starlinkUsage, NewStarlinkUsage } from '../../../models/StarlinkUsage'

interface CreateStarlinkUsageParams {
  reqObject: {
    user: any
  }
  data: NewStarlinkUsage
}

export async function createStarlinkUsage_func({ reqObject, data }: CreateStarlinkUsageParams) {
  try {
    const result = await db.insert(starlinkUsage).values(data).returning()

    return {
      success: true,
      data: result[0],
      message: 'Starlink usage created successfully'
    }
  } catch (error: any) {
    console.error('Error creating starlink usage:', error)
    return {
      success: false,
      message: 'Failed to create starlink usage',
      error: error.message
    }
  }
}