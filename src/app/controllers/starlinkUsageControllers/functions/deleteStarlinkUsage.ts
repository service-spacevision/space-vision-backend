import { db } from '../../../db/connection'
import { starlinkUsage } from '../../../models/StarlinkUsage'
import { eq, and } from 'drizzle-orm'

interface DeleteStarlinkUsageParams {
  reqObject: {
    user: any
  }
  query: {
    dateKey: string
    kitNumber: string
  }
}

export async function deleteStarlinkUsage_func({ reqObject, query }: DeleteStarlinkUsageParams) {
  try {
    if (!query.dateKey || !query.kitNumber) {
      return {
        success: false,
        message: 'Date key and kit number are required'
      }
    }

    const result = await db
      .delete(starlinkUsage)
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
      message: 'Starlink usage deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting starlink usage:', error)
    return {
      success: false,
      message: 'Failed to delete starlink usage',
      error: error.message
    }
  }
}