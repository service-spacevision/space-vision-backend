import { db } from '../../../db/connection'
import { starlinkUsage, vessels, vesselGroups } from '../../../db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'

interface GetStarlinkUsageByDateRangeParams {
  reqObject: {
    user: any
  }
  startDate: string
  endDate: string
}

export async function getStarlinkUsageByDateRange_func({
  reqObject,
  startDate,
  endDate
}: GetStarlinkUsageByDateRangeParams) {
  try {
    const { user } = reqObject

    // Validate date format (YYYYMMDD)
    const dateRegex = /^\d{8}$/
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return {
        success: false,
        message: 'Invalid date format. Please use YYYYMMDD format (e.g., 20250810)'
      }
    }

    // Ensure startDate is not greater than endDate
    if (startDate > endDate) {
      return {
        success: false,
        message: 'Start date cannot be greater than end date'
      }
    }

    // Query starlink usage data with vessel information
    const usageData = await db
      .select({
        // Starlink usage fields
        id: starlinkUsage.id,
        dateKey: starlinkUsage.dateKey,
        kitNumber: starlinkUsage.kitNumber,
        vesselName: starlinkUsage.vesselName,
        mobilePriorityGb: starlinkUsage.mobilePriorityGb,
        standardGb: starlinkUsage.standardGb,
        chargebeeSubscriptionId: starlinkUsage.chargebeeSubscriptionId,
        usageLimitGB: starlinkUsage.usageLimitGB,
        publicIP_Enabled: starlinkUsage.publicIP_Enabled,
        createdAt: starlinkUsage.createdAt,
        updatedAt: starlinkUsage.updatedAt,
        // Vessel fields (can be null if no matching vessel)
        vessel: {
          id: vessels.id,
          vesselsKitNumber: vessels.vesselsKitNumber,
          name: vessels.name,
          subscriptionPlan: vessels.subscriptionPlan,
          groupId: vessels.groupId,
          deviceId: vessels.deviceId,
          createdAt: vessels.createdAt,
          updatedAt: vessels.updatedAt
        },
        // Vessel group fields (can be null if no matching group)
        vesselGroup: {
          id: vesselGroups.id,
          groupName: vesselGroups.groupName,
          createdAt: vesselGroups.createdAt,
          updatedAt: vesselGroups.updatedAt
        }
      })
      .from(starlinkUsage)
      .leftJoin(vessels, eq(starlinkUsage.kitNumber, vessels.vesselsKitNumber))
      .leftJoin(vesselGroups, eq(vessels.groupId, vesselGroups.id))
      .where(
        and(
          gte(starlinkUsage.dateKey, startDate),
          lte(starlinkUsage.dateKey, endDate)
        )
      )
      .orderBy(starlinkUsage.dateKey, starlinkUsage.kitNumber)

    // Transform the data to a more readable format
    const transformedData = usageData.map(record => ({
      id: record.id,
      dateKey: record.dateKey,
      kitNumber: record.kitNumber,
      vesselName: record.vesselName,
      mobilePriorityGb: record.mobilePriorityGb,
      standardGb: record.standardGb,
      chargebeeSubscriptionId: record.chargebeeSubscriptionId,
      usageLimitGB: record.usageLimitGB,
      publicIP_Enabled: record.publicIP_Enabled,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      vessel: record.vessel && record.vessel.id ? {
        id: record.vessel.id,
        vesselsKitNumber: record.vessel.vesselsKitNumber,
        name: record.vessel.name,
        subscriptionPlan: record.vessel.subscriptionPlan,
        groupId: record.vessel.groupId,
        deviceId: record.vessel.deviceId,
        createdAt: record.vessel.createdAt,
        updatedAt: record.vessel.updatedAt,
        group: record.vesselGroup && record.vesselGroup.id ? {
          id: record.vesselGroup.id,
          groupName: record.vesselGroup.groupName,
          createdAt: record.vesselGroup.createdAt,
          updatedAt: record.vesselGroup.updatedAt
        } : null
      } : null
    }))

    // Calculate summary statistics
    const totalRecords = transformedData.length
    const totalPriorityData = transformedData.reduce((sum, record) =>
      sum + (record.mobilePriorityGb || 0), 0
    )
    const totalStandardData = transformedData.reduce((sum, record) =>
      sum + (record.standardGb || 0), 0
    )
    const uniqueKits = new Set(transformedData.map(record => record.kitNumber)).size
    const dateRange = {
      startDate,
      endDate,
      totalDays: transformedData.length > 0 ?
        new Set(transformedData.map(record => record.dateKey)).size : 0
    }

    return {
      success: true,
      message: 'Starlink usage data retrieved successfully',
      data: {
        records: transformedData,
        summary: {
          totalRecords,
          uniqueKits,
          totalPriorityDataGB: Math.round(totalPriorityData * 100) / 100,
          totalStandardDataGB: Math.round(totalStandardData * 100) / 100,
          totalDataGB: Math.round((totalPriorityData + totalStandardData) * 100) / 100,
          dateRange
        }
      }
    }

  } catch (error: any) {
    console.error('Error fetching starlink usage by date range:', error)
    return {
      success: false,
      message: 'Failed to fetch starlink usage data',
      error: error.message
    }
  }
}