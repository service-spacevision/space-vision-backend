import { db } from '../../../db/connection'
import { bluetideUsage } from '../../../models/BluetideUsage'
import { eq, and } from 'drizzle-orm'

interface DeleteBluetideUsageParams {
  reqObject: {
    user: any
  }
  query: {
    date: string
    kitp: string
  }
}

export async function deleteBluetideUsage_func({ reqObject, query }: DeleteBluetideUsageParams) {
  try {
    if (!query.date || !query.kitp) {
      return {
        success: false,
        message: 'Date and KITP are required'
      }
    }

    const result = await db
      .delete(bluetideUsage)
      .where(and(
        eq(bluetideUsage.date, query.date),
        eq(bluetideUsage.kitp, query.kitp)
      ))
      .returning()

    if (result.length === 0) {
      return {
        success: false,
        message: 'Bluetide usage not found'
      }
    }

    return {
      success: true,
      data: result[0],
      message: 'Bluetide usage deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting bluetide usage:', error)
    return {
      success: false,
      message: 'Failed to delete bluetide usage',
      error: error.message
    }
  }
}