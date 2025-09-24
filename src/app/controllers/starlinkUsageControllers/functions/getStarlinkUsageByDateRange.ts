import { db } from '../../../db/connection'
import { starlinkUsage, vessels, vesselGroups } from '../../../db/schema'
import { eq, and, gte, lte, inArray, SQL } from 'drizzle-orm'
import { isAdmin } from '../../../../utils/permissionUtils'
import { InferSelectModel } from 'drizzle-orm'

type VesselWithGroup = InferSelectModel<typeof vessels> & {
  group: InferSelectModel<typeof vesselGroups> | null;
};

type StarlinkUsageWithVessel = InferSelectModel<typeof starlinkUsage> & {
  vessel: VesselWithGroup | null;
};

type StarlinkUsageResponse = 
  | { success: true; message: string; data: { 
      records: Array<StarlinkUsageWithVessel & { 
        vessel: VesselWithGroup | null;
      }>; 
      summary: {
        totalRecords: number;
        uniqueKits: number;
        totalPriorityDataGB: number;
        totalStandardDataGB: number;
        totalDataGB: number;
        dateRange: {
          startDate: string;
          endDate: string;
          totalDays: number;
        };
      };
    }; 
  }
  | { success: false; message: string; error?: string; }
  | StarlinkUsageWithVessel[]; // For backward compatibility with non-admin flow

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
}: GetStarlinkUsageByDateRangeParams): Promise<StarlinkUsageResponse> {
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

    // Build base where conditions for date range
    const baseConditions = [
      gte(starlinkUsage.dateKey, startDate),
      lte(starlinkUsage.dateKey, endDate)
    ];

    // For non-admin users with permitted vessel groups, we need to join with vessels table
    if (!isAdmin(user) && user?.role?.permittedVesselGroups?.length) {
      const result = await db
        .select()
        .from(starlinkUsage)
        .leftJoin(vessels, eq(starlinkUsage.kitNumber, vessels.vesselsKitNumber))
        .leftJoin(vesselGroups, eq(vessels.groupId, vesselGroups.id))
        .where(
          and(
            ...baseConditions,
            inArray(vessels.groupId, user.role.permittedVesselGroups)
          )
        )
        .orderBy(starlinkUsage.dateKey, starlinkUsage.kitNumber);

      const resultData = result.map(row => ({
        ...row.starlink_usage,
        vessel: row.vessels ? {
          ...row.vessels,
          group: row.vessel_groups || null
        } : null
      })) as StarlinkUsageWithVessel[];
      
      // For backward compatibility, we'll return the array directly for non-admin users
      // But we should consider updating the calling code to handle the consistent response format
      return resultData;
    }

    // For admin users or users without vessel group restrictions
    const whereConditions = [...baseConditions];

    // Query starlink usage data with vessel information
    const result = await db
      .select()
      .from(starlinkUsage)
      .leftJoin(vessels, eq(starlinkUsage.kitNumber, vessels.vesselsKitNumber))
      .leftJoin(vesselGroups, eq(vessels.groupId, vesselGroups.id))
      .where(and(...whereConditions))
      .orderBy(starlinkUsage.dateKey, starlinkUsage.kitNumber);

    const usageData = result.map(row => ({
      ...row.starlink_usage,
      vessel: row.vessels ? {
        ...row.vessels,
        group: row.vessel_groups || null
      } : null
    })) as StarlinkUsageWithVessel[];

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
      vessel: record.vessel ? {
        id: record.vessel.id,
        vesselsKitNumber: record.vessel.vesselsKitNumber,
        name: record.vessel.name,
        subscriptionPlan: record.vessel.subscriptionPlan,
        groupId: record.vessel.groupId,
        deviceId: record.vessel.deviceId,
        createdAt: record.vessel.createdAt,
        updatedAt: record.vessel.updatedAt,
        group: record.vessel.group ? {
          id: record.vessel.group.id,
          groupName: record.vessel.group.groupName,
          createdAt: record.vessel.group.createdAt,
          updatedAt: record.vessel.group.updatedAt
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
        records: transformedData as Array<StarlinkUsageWithVessel & { vessel: VesselWithGroup | null }>,
        summary: {
          totalRecords,
          uniqueKits,
          totalPriorityDataGB: Math.round(totalPriorityData * 100) / 100,
          totalStandardDataGB: Math.round(totalStandardData * 100) / 100,
          totalDataGB: Math.round((totalPriorityData + totalStandardData) * 100) / 100,
          dateRange: {
            startDate,
            endDate,
            totalDays: dateRange.totalDays
          }
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