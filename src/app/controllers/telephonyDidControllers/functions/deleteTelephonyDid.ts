import { db } from '../../../db/connection'
import { telephonyDids } from '../../../models/TelephonyDid'
import { eq } from 'drizzle-orm'

interface DeleteTelephonyDidParams {
  reqObject: {
    user: any
  }
  query: {
    number: string
  }
}

export async function deleteTelephonyDid_func({ reqObject, query }: DeleteTelephonyDidParams) {
  try {
    if (!query.number) {
      return {
        success: false,
        message: 'Phone number is required'
      }
    }

    const result = await db
      .delete(telephonyDids)
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
      message: 'Telephony DID deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting telephony DID:', error)
    return {
      success: false,
      message: 'Failed to delete telephony DID',
      error: error.message
    }
  }
}