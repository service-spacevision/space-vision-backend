import { db } from "../../../db/connection";
import { starlinkUsage } from "../../../models/StarlinkUsage";
import { vessels } from "../../../models/Vessel";
import { eq, and, count, desc, SQL, gte, lte, inArray } from "drizzle-orm";
import { IPagination } from "../../../utils/types";
import { isAdmin } from "../../../../utils/permissionUtils";

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
    
    // Handle date range conditions
    if (query?.startDate && query?.endDate) {
      conditions.push(
        and(
          gte(starlinkUsage.dateKey, query.startDate),
          lte(starlinkUsage.dateKey, query.endDate)
        )
      );
    } else if (query?.startDate) {
      conditions.push(gte(starlinkUsage.dateKey, query.startDate));
    } else if (query?.endDate) {
      conditions.push(lte(starlinkUsage.dateKey, query.endDate));
    }
    
    // Handle kit number condition
    if (query?.kitNumber) {
      conditions.push(eq(starlinkUsage.kitNumber, query.kitNumber));
    }
    
    // Handle vessel name condition
    if (query?.vesselName) {
      conditions.push(eq(starlinkUsage.vesselName, query.vesselName));
    }
    
    // Check if user is non-admin with permitted vessel groups
    const user = reqObject?.user;
    if (!isAdmin(user) && user?.role?.permittedVesselGroups?.length) {
      // Get all kit numbers from permitted vessel groups
      const kitsInPermittedGroups = await db
        .select({ kitNumber: vessels.vesselsKitNumber })
        .from(vessels)
        .where(inArray(vessels.groupId, user.role.permittedVesselGroups));
      
      const permittedKitNumbers = kitsInPermittedGroups
        .map(k => k.kitNumber)
        .filter(Boolean) as string[];
      
      if (permittedKitNumbers.length === 0) {
        // No kits in permitted groups, return empty result
        return {
          success: true,
          message: "No data found for your permitted vessel groups",
          data: [],
          pagination: {
            total: 0,
            page: 1,
            pageSize: 0,
          },
        };
      }
      
      // Add condition to filter by permitted kit numbers
      conditions.push(inArray(starlinkUsage.kitNumber, permittedKitNumbers));
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
        .select({
          starlinkUsage,
          subscriptionPlan: vessels.subscriptionPlan
        })
        .from(starlinkUsage)
        .leftJoin(vessels, and(
          eq(starlinkUsage.kitNumber, vessels.vesselsKitNumber),
          eq(starlinkUsage.vesselName, vessels.name)
        ))
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
      .select({
        starlinkUsage,
        subscriptionPlan: vessels.subscriptionPlan
      })
      .from(starlinkUsage)
      .leftJoin(vessels, and(
        eq(starlinkUsage.kitNumber, vessels.vesselsKitNumber),
        eq(starlinkUsage.vesselName, vessels.name)
      ))
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
