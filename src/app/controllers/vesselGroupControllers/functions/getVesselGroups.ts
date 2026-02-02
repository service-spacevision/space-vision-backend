import { db } from "../../../db/connection";
import { vesselGroups } from "../../../models/VesselGroup";
import { eq, count, desc, like, and } from "drizzle-orm";
import { IPagination } from "../../../utils/types";
import { withVesselGroupFilter } from "../../../../utils/permissionUtils";
import { hasSystemRole } from "../../../utils/roleHelpers";

interface GetVesselGroupsParams {
  reqObject: {
    user: any;
  };
  query?: {
    groupName?: string;
  };
  pagination?: IPagination;
}

export async function getVesselGroups_func({
  reqObject,
  query,
  pagination,
}: GetVesselGroupsParams) {
  try {
    const whereConditions = [];

    // Add group name filter if provided
    if (query?.groupName) {
      whereConditions.push(like(vesselGroups.groupName, `%${query.groupName}%`));
    }

    // For non-system users, only show active vessel groups
    if (reqObject.user) {
      const isSystemUser = await hasSystemRole(reqObject.user.id);
      if (!isSystemUser) {
        whereConditions.push(eq(vesselGroups.isActive, true));
      }
    }

    // Apply vessel group filter based on user permissions
    const whereCondition = withVesselGroupFilter(reqObject?.user, whereConditions, vesselGroups.id);

    // If pagination.all is set, return all records without pagination
    if (pagination?.all === "true" || pagination?.all === "1") {
      const result = await db
        .select()
        .from(vesselGroups)
        .where(whereCondition)
        .orderBy(desc(vesselGroups.createdAt));

      return {
        success: true,
        message: "Vessel groups retrieved successfully",
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
      .from(vesselGroups)
      .where(whereCondition);

    const total = totalResult.count;

    // Get paginated data
    const result = await db
      .select()
      .from(vesselGroups)
      .where(whereCondition)
      .orderBy(desc(vesselGroups.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      success: true,
      message: "Vessel groups retrieved successfully",
      data: result,
      pagination: {
        total,
        page,
        pageSize,
      },
    };
  } catch (error: any) {
    console.error("Error fetching vessel groups:", error);
    return {
      success: false,
      message: "Failed to fetch vessel groups",
      error: error.message,
    };
  }
}
