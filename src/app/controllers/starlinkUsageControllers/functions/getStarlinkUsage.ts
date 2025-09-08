import { db } from "../../../db/connection";
import { starlinkUsage } from "../../../models/StarlinkUsage";
import { eq, and, count, desc, SQL, gte, lte } from "drizzle-orm";
import { IPagination } from "../../../utils/types";

interface GetStarlinkUsageParams {
  reqObject: {
    user: any;
  };
  query?: {
    startDate?: string;
    endDate?: string;
    kitNumber?: string;
    vesselName?: string;
  };
  pagination?: IPagination;
}

export async function getStarlinkUsage_func({
  reqObject,
  query,
  pagination,
}: GetStarlinkUsageParams) {
  try {
    const conditions: (SQL<unknown> | undefined)[] = [];
    if (query?.startDate && query?.endDate) {
      // Add date range condition using gte and lte for proper range query
      conditions.push(
        and(
          gte(starlinkUsage.dateKey, query.startDate),
          lte(starlinkUsage.dateKey, query.endDate)
        )
      );
    } else if (query?.startDate) {
      // If only startDate is provided, get records from startDate onwards
      conditions.push(gte(starlinkUsage.dateKey, query.startDate));
    } else if (query?.endDate) {
      // If only endDate is provided, get records up to endDate
      conditions.push(lte(starlinkUsage.dateKey, query.endDate));
    }
    if (query?.kitNumber) {
      conditions.push(eq(starlinkUsage.kitNumber, query.kitNumber));
    }
    if (query?.vesselName) {
      conditions.push(eq(starlinkUsage.vesselName, query.vesselName));
    }

    // Filter out any undefined conditions and combine with AND
    const definedConditions = conditions.filter(
      (c): c is SQL<unknown> => c !== undefined
    );
    const whereCondition =
      definedConditions.length > 0 ? and(...definedConditions) : undefined;

    // If pagination.all is set, return all records without pagination
    if (pagination?.all === "true" || pagination?.all === "1") {
      const result = await db
        .select()
        .from(starlinkUsage)
        .where(whereCondition)
        .orderBy(desc(starlinkUsage.createdAt));

      return {
        success: true,
        message: "Starlink usage retrieved successfully",
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

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(starlinkUsage)
      .where(whereCondition);

    const total = totalResult.count;

    // Get paginated data
    const result = await db
      .select()
      .from(starlinkUsage)
      .where(whereCondition)
      .orderBy(desc(starlinkUsage.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      success: true,
      message: "Starlink usage retrieved successfully",
      data: result,
      pagination: {
        total,
        page,
        pageSize,
      },
    };
  } catch (error: any) {
    console.error("Error fetching starlink usage:", error);
    return {
      success: false,
      message: "Failed to fetch starlink usage",
      error: error.message,
    };
  }
}
