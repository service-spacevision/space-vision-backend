import { db } from '../../../db/connection'
import { bluetideUsage } from '../../../models/BluetideUsage'
import { eq, and } from 'drizzle-orm'

interface UpdateBluetideUsageParams {
  reqObject: {
    user: any
  }
  query: {
    date: string
    kitp: string
  }
  data: {
    name?: string
    usageGb?: number
  }
}

export async function updateBluetideUsage_func({ reqObject, query, data }: UpdateBluetideUsageParams) {
  try {
    if (!query.date || !query.kitp) {
      return {
        success: false,
        message: 'Date and KITP are required'
      }
    }

    const updateData = {
      ...data,
      updatedAt: new Date()
    }

    const result = await db
      .update(bluetideUsage)
      .set(updateData)
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
      message: 'Bluetide usage updated successfully'
    }
  } catch (error: any) {
    console.error('Error updating bluetide usage:', error)
    return {
      success: false,
      message: 'Failed to update bluetide usage',
      error: error.message
    }
  }
}