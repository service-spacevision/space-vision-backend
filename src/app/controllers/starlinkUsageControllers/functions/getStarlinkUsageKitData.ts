import { db } from "../../../db/connection";
import { starlinkUsage } from "../../../models/StarlinkUsage";
import { vessels } from "../../../models/Vessel";
import { and, gte, lte, sql, eq, count } from "drizzle-orm";
import { format } from "date-fns";
import { IPagination } from "../../../utils/types";

interface GetStarlinkUsageKitDataParams {
  reqObject: {
    user: any;
  };
  query: {
    startDate: string;
    endDate: string;
    kitNumber?: string;
  };
  pagination?: IPagination;
}

export async function getStarlinkUsageKitData_func({
  reqObject,
  query,
  pagination,
}: GetStarlinkUsageKitDataParams) {
  try {
    const { startDate, endDate, kitNumber } = query;

    // Validate date format (YYYYMMDD)
    const dateRegex = /^\d{8}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error("Invalid date format. Please use YYYYMMDD format.");
    }

    // Convert string dates to Date objects for comparison
    const startDateObj = new Date(
      parseInt(startDate.substring(0, 4)),
      parseInt(startDate.substring(4, 6)) - 1,
      parseInt(startDate.substring(6, 8))
    );

    const endDateObj = new Date(
      parseInt(endDate.substring(0, 4)),
      parseInt(endDate.substring(4, 6)) - 1,
      parseInt(endDate.substring(6, 8))
    );

    // Build the query conditions
    const conditions = [
      gte(starlinkUsage.dateKey, startDate),
      lte(starlinkUsage.dateKey, endDate),
    ];

    if (kitNumber) {
      conditions.push(eq(starlinkUsage.kitNumber, kitNumber));
    }

    // If pagination.all is set, return all records without pagination
    if (pagination?.all === "true" || pagination?.all === "1") {
      const usageData = await db
        .select({
          id: starlinkUsage.id,
          dateKey: starlinkUsage.dateKey,
          kitNumber: starlinkUsage.kitNumber,
          vesselName: vessels.name,
          mobilePriorityGb: starlinkUsage.mobilePriorityGb,
          standardGb: starlinkUsage.standardGb,
        })
        .from(starlinkUsage)
        .leftJoin(
          vessels,
          eq(starlinkUsage.kitNumber, vessels.vesselsKitNumber)
        )
        .where(and(...conditions))
        .orderBy(starlinkUsage.dateKey);

      const result = processKitData(usageData, startDate, endDate);

      return {
        success: true,
        message: "Starlink usage kit data retrieved successfully",
        data: result,
        pagination: {
          total: result.length,
          page: 1,
          pageSize: result.length,
        },
      };
    }

    // Default pagination values
    const page = pagination?.currentPage || 1;
    const pageSize = pagination?.pageSize || 10;
    const offset = (page - 1) * pageSize;

    // First, get the total count of unique kit numbers
    const [totalResult] = await db
      .select({
        count: sql<number>`count(distinct ${starlinkUsage.kitNumber})`,
      })
      .from(starlinkUsage)
      .where(and(...conditions));

    const total = Number(totalResult?.count) || 0;

    // Then get the paginated data
    const usageData = await db
      .select({
        id: starlinkUsage.id,
        dateKey: starlinkUsage.dateKey,
        kitNumber: starlinkUsage.kitNumber,
        vesselName: vessels.name,
        mobilePriorityGb: starlinkUsage.mobilePriorityGb,
        standardGb: starlinkUsage.standardGb,
      })
      .from(starlinkUsage)
      .leftJoin(vessels, eq(starlinkUsage.kitNumber, vessels.vesselsKitNumber))
      .where(and(...conditions))
      .orderBy(starlinkUsage.dateKey)
      .limit(pageSize)
      .offset(offset);

    const result = processKitData(usageData, startDate, endDate);

    return {
      success: true,
      message: "Starlink usage kit data retrieved successfully",
      data: result,
      pagination: {
        total,
        page,
        pageSize,
      },
    };
  } catch (error: any) {
    console.error("Error fetching starlink usage kit data:", error);
    return {
      success: false,
      message: "Failed to fetch starlink usage kit data",
      error: error.message,
    };
  }
}

// Helper function to process kit data into the required format
function processKitData(usageData: any[], startDate: string, endDate: string) {
  if (usageData.length === 0) {
    return [];
  }

  // Group data by kit number
  const groupedByKit = usageData.reduce((acc, item) => {
    if (!acc[item.kitNumber]) {
      acc[item.kitNumber] = {
        id: item.id,
        vessel_name: item.vesselName || "Unknown Vessel",
        vesselkit_number: item.kitNumber,
        startDate: parseInt(startDate),
        endDate: parseInt(endDate),
        totalPriorityGB: 0,
        totalStandardGB: 0,
        series: [
          { name: "mobile_priority_gb", data: [] as number[] },
          { name: "standard_gb", data: [] as number[] },
        ],
        range: [] as string[],
      };
    }

    const priorityGB = Number(item.mobilePriorityGb) || 0;
    const standardGB = Number(item.standardGb) || 0;

    // Add data points to the series
    acc[item.kitNumber].series[0].data.push(priorityGB);
    acc[item.kitNumber].series[1].data.push(standardGB);

    // Update cumulative totals
    acc[item.kitNumber].totalPriorityGB = parseFloat(
      (acc[item.kitNumber].totalPriorityGB + priorityGB).toFixed(2)
    );
    acc[item.kitNumber].totalStandardGB = parseFloat(
      (acc[item.kitNumber].totalStandardGB + standardGB).toFixed(2)
    );

    // Format date for range (e.g., "01 Jan")
    if (
      acc[item.kitNumber].range.length <
      acc[item.kitNumber].series[0].data.length
    ) {
      const date = new Date(
        parseInt(item.dateKey.substring(0, 4)),
        parseInt(item.dateKey.substring(4, 6)) - 1,
        parseInt(item.dateKey.substring(6, 8))
      );
      acc[item.kitNumber].range.push(format(date, "dd MMM"));
    }

    return acc;
  }, {} as Record<string, any>);

  return Object.values(groupedByKit);
}
