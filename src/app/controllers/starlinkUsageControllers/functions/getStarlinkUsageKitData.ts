import { db } from "../../../db/connection";
import { starlinkUsage } from "../../../models/StarlinkUsage";
import { vessels } from "../../../models/Vessel";
import { and, gte, lte, sql, eq, count, inArray } from "drizzle-orm";
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

    // First, get the paginated kit numbers
    const kitNumbers = await db
      .selectDistinct({
        kitNumber: starlinkUsage.kitNumber,
      })
      .from(starlinkUsage)
      .where(and(...conditions))
      .limit(pageSize)
      .offset(offset);

    if (kitNumbers.length === 0) {
      return {
        success: true,
        message: "No data found for the specified criteria",
        data: [],
        pagination: {
          total: 0,
          page,
          pageSize,
        },
      };
    }

    // Then get all data for these kits within the date range
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
      .where(
        and(
          gte(starlinkUsage.dateKey, startDate),
          lte(starlinkUsage.dateKey, endDate),
          inArray(
            starlinkUsage.kitNumber,
            kitNumbers.map(k => k.kitNumber)
          )
        )
      )
      .orderBy(starlinkUsage.kitNumber, starlinkUsage.dateKey);

    // Get total count of unique kits for pagination
    const [totalResult] = await db
      .select({
        count: sql<number>`count(distinct ${starlinkUsage.kitNumber})`,
      })
      .from(starlinkUsage)
      .where(and(...conditions));

    const total = Number(totalResult?.count) || 0;

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

// Helper function to generate all dates in a range
function getDatesInRange(startDate: string, endDate: string): string[] {
  const start = new Date(
    parseInt(startDate.substring(0, 4)),
    parseInt(startDate.substring(4, 6)) - 1,
    parseInt(startDate.substring(6, 8))
  );
  const end = new Date(
    parseInt(endDate.substring(0, 4)),
    parseInt(endDate.substring(4, 6)) - 1,
    parseInt(endDate.substring(6, 8))
  );
  
  const dateArray: string[] = [];
  let currentDate = new Date(start);
  
  while (currentDate <= end) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    dateArray.push(`${year}${month}${day}`);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dateArray;
}

// Helper function to process kit data into the required format
function processKitData(usageData: any[], startDate: string, endDate: string) {
  if (usageData.length === 0) {
    return [];
  }

  // Get all dates in the range
  const allDates = getDatesInRange(startDate, endDate);
  
  // Create a map of kitNumber to its data for quick lookup
  const kitDataMap = new Map<string, any>();
  
  // First pass: group data by kit number and date
  usageData.forEach(item => {
    const kitNumber = item.kitNumber;
    if (!kitDataMap.has(kitNumber)) {
      kitDataMap.set(kitNumber, {
        id: item.id,
        vessel_name: item.vesselName || "Unknown Vessel",
        vesselkit_number: kitNumber,
        startDate: parseInt(startDate),
        endDate: parseInt(endDate),
        totalPriorityGB: 0,
        totalStandardGB: 0,
        series: [
          { name: "mobile_priority_gb", data: new Array(allDates.length).fill(0) },
          { name: "standard_gb", data: new Array(allDates.length).fill(0) },
        ],
        range: allDates.map(date => {
          const d = new Date(
            parseInt(date.substring(0, 4)),
            parseInt(date.substring(4, 6)) - 1,
            parseInt(date.substring(6, 8))
          );
          return format(d, "dd MMM");
        }),
      });
    }
    
    // Find the index of this date in the allDates array
    const dateIndex = allDates.indexOf(item.dateKey);
    if (dateIndex !== -1) {
      const kitData = kitDataMap.get(kitNumber)!;
      const priorityGB = Number(item.mobilePriorityGb) || 0;
      const standardGB = Number(item.standardGb) || 0;
      
      // Set the values at the correct date index
      kitData.series[0].data[dateIndex] = priorityGB;
      kitData.series[1].data[dateIndex] = standardGB;
      
      // Update totals
      kitData.totalPriorityGB = parseFloat(
        (kitData.totalPriorityGB + priorityGB).toFixed(2)
      );
      kitData.totalStandardGB = parseFloat(
        (kitData.totalStandardGB + standardGB).toFixed(2)
      );
    }
  });

  return Array.from(kitDataMap.values());
}
