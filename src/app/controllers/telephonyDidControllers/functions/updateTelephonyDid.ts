import { db } from '../../../db/connection'
import { telephonyDids } from '../../../models/TelephonyDid'
import { eq } from 'drizzle-orm'

interface UpdateTelephonyDidParams {
  reqObject: {
    user: any
  }
  query: {
    number: string
  }
  data: {
    description?: string
    expiresAt?: Date
    channelsIncludedCount?: number
    dedicatedChannelsCount?: number
    blocked?: boolean
    terminated?: boolean
  }
}

export async function updateTelephonyDid_func({ reqObject, query, data }: UpdateTelephonyDidParams) {
  try {
    if (!query.number) {
      return {
        success: false,
        message: 'Phone number is required'
      }
    }

    const updateData = {
      ...data,
      updatedAt: new Date()
    }

    const result = await db
      .update(telephonyDids)
      .set(updateData)
      .where(eq(telephonyDids.number, query.number))
      .returning()

    if (result.length === 0) {
      return {
        success: false,
        message: 'Telephony DID not found'
      }
    }

    return {
      success: true,
      data: result[0],
      message: 'Telephony DID updated successfully'
    }
  } catch (error: any) {
    console.error('Error updating telephony DID:', error)
    return {
      success: false,
      message: 'Failed to update telephony DID',
      error: error.message
    }
  }
}