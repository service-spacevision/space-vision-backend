import { db } from '../../../db/connection'
import { bluetideUsage } from '../../../models/BluetideUsage'
import { eq, and } from 'drizzle-orm'

interface GetBluetideUsageParams {
  reqObject: {
    user: any
  }
  query?: {
    date?: string
    kitp?: string
    name?: string
  }
}

export async function getBluetideUsage_func({ reqObject, query }: GetBluetideUsageParams) {
  try {
    let queryBuilder = db.select().from(bluetideUsage)

    const conditions = []
    if (query?.date) {
      conditions.push(eq(bluetideUsage.date, query.date))
    }
    if (query?.kitp) {
      conditions.push(eq(bluetideUsage.kitp, query.kitp))
    }
    if (query?.name) {
      conditions.push(eq(bluetideUsage.name, query.name))
    }

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions))
    }

    const result = await queryBuilder

    return {
      success: true,
      data: result,
      message: 'Bluetide usage retrieved successfully'
    }
  } catch (error: any) {
    console.error('Error fetching bluetide usage:', error)
    return {
      success: false,
      message: 'Failed to fetch bluetide usage',
      error: error.message
    }
  }
}