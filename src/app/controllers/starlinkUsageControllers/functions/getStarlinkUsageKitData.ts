import { db } from "../../../db/connection";
import { starlinkUsage } from "../../../models/StarlinkUsage";
import { vessels } from "../../../models/Vessel";
import { vesselGroups } from "../../../models/VesselGroup";
import { and, gte, lte, sql, eq, count, inArray, desc } from "drizzle-orm";
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
    groupName?: string;
    vesselName?: string;
  };
  pagination?: IPagination;
}

export async function getStarlinkUsageKitData_func({
  reqObject,
  query,
  pagination,
}: GetStarlinkUsageKitDataParams) {
  try {
    const { startDate, endDate, kitNumber, groupName, vesselName } = query;

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

    if (vesselName) {
      conditions.push(sql`LOWER(${vessels.name}) LIKE LOWER(${`%${vesselName}%`})`);
    }

    if (groupName) {
      // group by name -> get group id
      const [group] = await db
        .select({ id: vesselGroups.id })
        .from(vesselGroups)
        .where(eq(vesselGroups.groupName, groupName));

      if (!group) {
        return {
          success: true,
          message: "No data found for the specified criteria",
          data: [],
          pagination: {
            total: 0,
            page: pagination?.currentPage || 1,
            pageSize: pagination?.pageSize || 10,
          },
        };
      }

      // Get all kit numbers under this group
      const kitsInGroup = await db
        .select({ kit: vessels.vesselsKitNumber })
        .from(vessels)
        .where(eq(vessels.groupId, group.id));

      const groupKitNumbers = kitsInGroup
        .map((k) => k.kit)
        .filter(Boolean) as string[];

      if (groupKitNumbers.length === 0) {
        return {
          success: true,
          message: "No data found for the specified criteria",
          data: [],
          pagination: {
            total: 0,
            page: pagination?.currentPage || 1,
            pageSize: pagination?.pageSize || 10,
          },
        };
      }

      conditions.push(inArray(starlinkUsage.kitNumber, groupKitNumbers));
    }

    // If pagination.all is set, return all records without pagination
    if (pagination?.all === "true" || pagination?.all === "1") {
      const usageData = await db
        .select({
          id: starlinkUsage.id,
          dateKey: starlinkUsage.dateKey,
          kitNumber: starlinkUsage.kitNumber,
          vesselName: vessels.name,
          groupName: vesselGroups.groupName,
          mobilePriorityGb: starlinkUsage.mobilePriorityGb,
          standardGb: starlinkUsage.standardGb,
          chargebeeSubscriptionId: starlinkUsage.chargebeeSubscriptionId,
          usageLimitGB: starlinkUsage.usageLimitGB,
          publicIP_Enabled: starlinkUsage.publicIP_Enabled,
          createdAt: starlinkUsage.createdAt,
          updatedAt: starlinkUsage.updatedAt,
        })
        .from(starlinkUsage)
        .leftJoin(
          vessels,
          eq(starlinkUsage.kitNumber, vessels.vesselsKitNumber)
        )
        .leftJoin(
          vesselGroups,
          eq(vessels.groupId, vesselGroups.id)
        )
        .where(and(...conditions))
        .orderBy(starlinkUsage.dateKey);

      const result = await processKitData(usageData, startDate, endDate);

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

    // pagination values
    const page = pagination?.currentPage || 1;
    const pageSize = pagination?.pageSize || 10;
    const offset = (page - 1) * pageSize;

    // Get total count for pagination
    const [totalResult] = await db
      .select({
        count: sql<number>`count(distinct ${starlinkUsage.kitNumber})`,
      })
      .from(starlinkUsage)
      .leftJoin(vessels, eq(starlinkUsage.kitNumber, vessels.vesselsKitNumber))
      .leftJoin(vesselGroups, eq(vessels.groupId, vesselGroups.id))
      .where(and(...conditions));

    const total = Number(totalResult?.count) || 0;

    // get the paginated kit numbers
    const kitNumbers = await db
      .selectDistinct({
        kitNumber: starlinkUsage.kitNumber,
      })
      .from(starlinkUsage)
      .leftJoin(vessels, eq(starlinkUsage.kitNumber, vessels.vesselsKitNumber))
      .leftJoin(vesselGroups, eq(vessels.groupId, vesselGroups.id))
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
    const kitNumberList = kitNumbers.map((k) => k.kitNumber);
    const usageData = await db
      .select({
        id: starlinkUsage.id,
        dateKey: starlinkUsage.dateKey,
        kitNumber: starlinkUsage.kitNumber,
        vesselName: vessels.name,
        groupName: vesselGroups.groupName,
        mobilePriorityGb: starlinkUsage.mobilePriorityGb,
        standardGb: starlinkUsage.standardGb,
        createdAt: starlinkUsage.createdAt,
        updatedAt: starlinkUsage.updatedAt,
        chargebeeSubscriptionId: starlinkUsage.chargebeeSubscriptionId,
        usageLimitGB: starlinkUsage.usageLimitGB,
        publicIP_Enabled: starlinkUsage.publicIP_Enabled,
      })
      .from(starlinkUsage)
      .leftJoin(vessels, eq(starlinkUsage.kitNumber, vessels.vesselsKitNumber))
      .leftJoin(vesselGroups, eq(vessels.groupId, vesselGroups.id))
      .where(
        and(...conditions, inArray(starlinkUsage.kitNumber, kitNumberList))
      )
      .orderBy(desc(starlinkUsage.createdAt));


    const result = await processKitData(usageData, startDate, endDate);

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
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    dateArray.push(`${year}${month}${day}`);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateArray;
}

// Helper function to process kit data into the required format
async function processKitData(usageData: any[], startDate: string, endDate: string) {
  if (usageData.length === 0) {
    return [];
  }

  // Get all dates in the range
  const allDates = getDatesInRange(startDate, endDate);

  // Get current month start and end dates
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentMonthStart = new Date(currentYear, currentMonth - 1, 1);
  const currentMonthEnd = new Date(currentYear, currentMonth, 0);

  // Format current month dates as YYYYMMDD
  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const currentMonthStartKey = formatDateKey(currentMonthStart);
  const currentMonthEndKey = formatDateKey(currentMonthEnd);

  // Create a map of kitNumber to its data for quick lookup
  const kitDataMap = new Map<string, any>();
  const kitOrder: string[] = [];

  // First pass: group data by kit number and date
  usageData.forEach((item) => {
    const kitNumber = item.kitNumber;
    if (!kitDataMap.has(kitNumber)) {
      kitOrder.push(kitNumber);
      kitDataMap.set(kitNumber, {
        id: item.id,
        vessel_name: item.vesselName || "Unknown Vessel",
        vesselkit_number: kitNumber,
        group_name: item.groupName || "No Group",
        startDate: parseInt(startDate),
        endDate: parseInt(endDate),
        totalPriorityGB: 0,
        totalStandardGB: 0,
        currentMonthUsage: 0, // Initialize current month usage
        chargebeeSubscriptionId: item.chargebeeSubscriptionId,
        usageLimitGB: item.usageLimitGB,
        publicIP_Enabled: item.publicIP_Enabled,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        combinedGB: 0,
        series: [
          {
            name: "mobile_priority_gb",
            data: new Array(allDates.length).fill(0),
          },
          { name: "standard_gb", data: new Array(allDates.length).fill(0) },
        ],
        range: allDates.map((date) => {
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
    const dateKey = item.dateKey;
    const dateIndex = allDates.indexOf(dateKey);
    if (dateIndex !== -1) {
      const kitData = kitDataMap.get(kitNumber)!;
      const priorityGB = Number(item.mobilePriorityGb) || 0;
      const standardGB = Number(item.standardGb) || 0;
      const totalGB = priorityGB + standardGB;

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
      kitData.combinedGB = parseFloat(
        (kitData.combinedGB + totalGB).toFixed(2)
      );
      
        // Current month usage will be calculated separately below
    }
  });

  // Get current month's data for all kits
  const kitNumbers = Array.from(kitDataMap.keys());
  if (kitNumbers.length > 0) {
    // Get current month's start and end dates
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentMonthStart = `${currentYear}${String(currentMonth).padStart(2, '0')}01`;
    // Last day of current month
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    const currentMonthEnd = `${currentYear}${String(currentMonth).padStart(2, '0')}${lastDay}`;

    // Fetch current month's data for all kits regardless of the original date filter
    const currentMonthData = await db
      .select({
        kitNumber: starlinkUsage.kitNumber,
        mobilePriorityGb: sql<number>`COALESCE(SUM(${starlinkUsage.mobilePriorityGb}::numeric), 0)`,
        standardGb: sql<number>`COALESCE(SUM(${starlinkUsage.standardGb}::numeric), 0)`
      })
      .from(starlinkUsage)
      .where(
        and(
          inArray(starlinkUsage.kitNumber, kitNumbers),
          gte(starlinkUsage.dateKey, currentMonthStart),
          lte(starlinkUsage.dateKey, currentMonthEnd)
        )
      )
      .groupBy(starlinkUsage.kitNumber);

    // Update currentMonthUsage for each kit
    currentMonthData.forEach(item => {
      const kitData = kitDataMap.get(item.kitNumber);
      if (kitData) {
        const totalGB = (Number(item.mobilePriorityGb) || 0) + (Number(item.standardGb) || 0);
        kitData.currentMonthUsage = parseFloat(totalGB.toFixed(2));
      }
    });
  }

  return Array.from(kitDataMap.values());
}
