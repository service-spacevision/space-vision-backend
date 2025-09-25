import { db } from "../../../db/connection";
import { vesselGroups, vessels } from "../../../db/schema";
import { eq } from "drizzle-orm";

interface GetAllVesselsGroupedParams {
  reqObject: {
    user: any;
  };
  query?: any;
  pagination: {
    currentPage: number;
    pageSize: number;
    all: string;
  };
}

export async function getAllVesselsGrouped_func({
  reqObject,
  query,
  pagination,
}: GetAllVesselsGroupedParams) {
  try {
    // First, get all vessel groups
    const allVesselGroups = await db
      .select()
      .from(vesselGroups)
      .orderBy(vesselGroups.groupName);

    // Then, for each group, get its vessels
    if (pagination.all === "true") {
      const vesselsGroupedData = await Promise.all(
        allVesselGroups.map(async (group) => {
          const groupVessels = await db
            .select()
            .from(vessels)
            .where(eq(vessels.groupId, group.id))
            .orderBy(vessels.name);

          return {
            id: group.id,
            groupName: group.groupName,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
            vessels: groupVessels,
          };
        })
      );
      return {
        success: true,
        message: "Vessels grouped by groups fetched successfully",
        data: vesselsGroupedData,
        pagination: {
          currentPage: 1,
          pageSize: vesselsGroupedData.length,
          totalItems: vesselsGroupedData.length,
          totalPages: 1,
        },
      };
    } else {
      const offset = (pagination.currentPage - 1) * pagination.pageSize;
      const [paginatedVesselsGrouped, totalCount] = await Promise.all([
        // Get paginated vessel groups
        Promise.all(
          allVesselGroups
            .slice(offset, offset + pagination.pageSize)
            .map(async (group) => {
              const groupVessels = await db
                .select()
                .from(vessels)
                .where(eq(vessels.groupId, group.id))
                .orderBy(vessels.name);

              return {
                id: group.id,
                groupName: group.groupName,
                createdAt: group.createdAt,
                updatedAt: group.updatedAt,
                vessels: groupVessels,
              };
            })
        ),
        // Get total count of vessel groups
        db.select().from(vesselGroups),
      ]);
      const totalPages = Math.ceil(totalCount.length / pagination.pageSize);
      return {
        success: true,
        message: "Vessels grouped by groups fetched successfully",
        data: paginatedVesselsGrouped,
        pagination: {
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
          totalItems: totalCount.length,
          totalPages,
        },
      };
    }
  } catch (error) {
    console.error("Error in getAllVesselsGrouped_func:", error);
    return {
      success: false,
      message: "Failed to fetch vessels grouped by groups",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
