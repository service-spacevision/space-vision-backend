import { db } from '../../../db/connection'
import { starlinkUsage } from '../../../models/StarlinkUsage'
import { eq, and } from 'drizzle-orm'

interface UpdateStarlinkUsageParams {
  reqObject: {
    user: any
  }
  query: {
    dateKey: string
    kitNumber: string
  }
  data: {
    vesselName?: string
    mobilePriorityGb?: number
    standardGb?: number
    chargebeeSubscriptionId?: string
  }
}

export async function updateStarlinkUsage_func({ reqObject, query, data }: UpdateStarlinkUsageParams) {
  try {
    if (!query.dateKey || !query.kitNumber) {
      return {
        success: false,
        message: 'Date key and kit number are required'
      }
    }

    const updateData = {
      ...data,
      updatedAt: new Date()
    }

    const result = await db
      .update(starlinkUsage)
      .set(updateData)
      .where(and(
        eq(starlinkUsage.dateKey, query.dateKey),
        eq(starlinkUsage.kitNumber, query.kitNumber)
      ))
      .returning()

    if (result.length === 0) {
      return {
        success: false,
        message: 'Starlink usage not found'
      }
    }

    return {
      success: true,
      data: result[0],
      message: 'Starlink usage updated successfully'
    }
  } catch (error: any) {
    console.error('Error updating starlink usage:', error)
    return {
      success: false,
      message: 'Failed to update starlink usage',
      error: error.message
    }
  }
}