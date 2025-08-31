import { db } from '../../../db/connection'
import { telephonyDids, NewTelephonyDid } from '../../../models/TelephonyDid'

interface CreateTelephonyDidParams {
  reqObject: {
    user: any
  }
  data: NewTelephonyDid
}

export async function createTelephonyDid_func({ reqObject, data }: CreateTelephonyDidParams) {
  try {
    const result = await db.insert(telephonyDids).values(data).returning()

    return {
      success: true,
      data: result[0],
      message: 'Telephony DID created successfully'
    }
  } catch (error: any) {
    console.error('Error creating telephony DID:', error)
    return {
      success: false,
      message: 'Failed to create telephony DID',
      error: error.message
    }
  }
}