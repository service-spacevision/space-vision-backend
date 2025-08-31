import { db } from '../../../db/connection'
import { bluetideUsage, NewBluetideUsage } from '../../../models/BluetideUsage'

interface CreateBluetideUsageParams {
  reqObject: {
    user: any
  }
  data: NewBluetideUsage
}

export async function createBluetideUsage_func({ reqObject, data }: CreateBluetideUsageParams) {
  try {
    const result = await db.insert(bluetideUsage).values(data).returning()

    return {
      success: true,
      data: result[0],
      message: 'Bluetide usage created successfully'
    }
  } catch (error: any) {
    console.error('Error creating bluetide usage:', error)
    return {
      success: false,
      message: 'Failed to create bluetide usage',
      error: error.message
    }
  }
}