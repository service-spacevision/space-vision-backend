import { db } from '../../../db/connection'
import { starlinkUsage } from '../../../models/StarlinkUsage'
import { eq, and } from 'drizzle-orm'
import axios from 'axios'
import { AuthUser } from '../../../utils/types'
import { refreshStarlinkUsageViews } from '../../../utils/refreshMaterializedViews'

interface StarlinkApiResponse {
  customerId: string
  data: Array<{
    dateKey: string
    date: string
    subscriptionID: string
    kitSerialNumber: string
    priorityDataGB: number
    standardDataGB: number
    usageLimitGB: number
    publicIP_Enabled: boolean
  }>
}

interface SyncStarlinkUsageParams {
  reqObject: {
    user: AuthUser
  }
  datekey?: number
}

export async function syncStarlinkUsage_func({ reqObject, datekey }: SyncStarlinkUsageParams) {
  try {
    const { user } = reqObject
    console.log("requestedBy", user);

    let apiRoute = `${process.env.STARLINK_API_URL}`
    if (datekey) {
      apiRoute += `?datekey=${datekey}`
    }
    // Fetch data from external API using axios
    const response = await axios.get<StarlinkApiResponse>(apiRoute, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.STARLINK_API_KEY
      }
    })

    const apiData = response.data

    if (!apiData.data || !Array.isArray(apiData.data)) {
      return {
        success: false,
        message: 'Invalid response format from Starlink API'
      }
    }

    let insertedCount = 0
    let updatedCount = 0
    let skippedCount = 0

    // Process each record from the API
    for (const record of apiData.data) {
      try {
        // Check if record already exists
        const existingRecord = await db
          .select()
          .from(starlinkUsage)
          .where(
            and(
              eq(starlinkUsage.dateKey, record.dateKey),
              eq(starlinkUsage.kitNumber, record.kitSerialNumber)
            )
          )
          .limit(1)

        const newData = {
          dateKey: record.dateKey,
          kitNumber: record.kitSerialNumber,
          mobilePriorityGb: record.priorityDataGB,
          standardGb: record.standardDataGB,
          chargebeeSubscriptionId: record.subscriptionID,
          usageLimitGB: record.usageLimitGB,
          publicIP_Enabled: record.publicIP_Enabled,
          updatedAt: new Date()
        }

        if (existingRecord.length === 0) {
          // Insert new record
          await db.insert(starlinkUsage).values({
            ...newData,
            createdAt: new Date()
          })
          insertedCount++
        } else {
          // Check if data has changed
          const existing = existingRecord[0]
          const hasChanged =
            existing.mobilePriorityGb !== record.priorityDataGB ||
            existing.standardGb !== record.standardDataGB ||
            existing.chargebeeSubscriptionId !== record.subscriptionID ||
            existing.usageLimitGB !== record.usageLimitGB ||
            existing.publicIP_Enabled !== record.publicIP_Enabled

          if (hasChanged) {
            // Update existing record
            await db
              .update(starlinkUsage)
              .set(newData)
              .where(
                and(
                  eq(starlinkUsage.dateKey, record.dateKey),
                  eq(starlinkUsage.kitNumber, record.kitSerialNumber)
                )
              )
            updatedCount++
          } else {
            skippedCount++
          }
        }
      } catch (recordError) {
        console.error(`Error processing record for kit ${record.kitSerialNumber}:`, recordError)
        // Continue processing other records
      }
    }

    // Refresh materialized views after successful sync
    try {
      await refreshStarlinkUsageViews()
      console.log('Materialized views refreshed successfully after sync')
    } catch (viewError) {
      console.error('Error refreshing materialized views after sync:', viewError)
      // Don't fail the sync operation if view refresh fails
    }

    return {
      success: true,
      message: 'Starlink usage data synchronized successfully',
      data: {
        totalRecords: apiData.data.length,
        inserted: insertedCount,
        updated: updatedCount,
        skipped: skippedCount,
        customerId: apiData.customerId,
        datekey: datekey || 'latest'
      }
    }

  } catch (error: any) {
    console.error('Error syncing starlink usage:', error)

    // Handle axios-specific errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const statusText = error.response?.statusText
      const message = error.response?.data?.message || error.message

      return {
        success: false,
        message: `Failed to fetch data from Starlink API: ${status} ${statusText}`,
        error: message
      }
    }

    return {
      success: false,
      message: 'Failed to sync starlink usage data',
      error: error.message
    }
  }
}