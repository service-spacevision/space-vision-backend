import { db } from '../../../db/connection';
import { vesselGroups, vessels } from '../../../db/schema';
import { eq, ilike, or, and } from 'drizzle-orm';

interface GetAllVesselsGroupedParams {
  reqObject: {
    user: any;
  };
  query?: {
    search?: string;
  };
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
    const searchQuery = query?.search || '';

    if (searchQuery) {
      const searchTerm = `%${searchQuery}%`;
      console.log('Search term:', searchTerm);

      // Build search conditions for groups and vessels
      const groupSearchCondition = ilike(vesselGroups.groupName, searchTerm);
      const vesselSearchCondition = or(
        ilike(vessels.name, searchTerm),
        ilike(vessels.vesselsKitNumber, searchTerm),
        ilike(vessels.deviceId, searchTerm)
      );

      // Get groups that match search OR have vessels that match search
      const allVesselGroups = await db
        .select({
          id: vesselGroups.id,
          groupName: vesselGroups.groupName,
          createdAt: vesselGroups.createdAt,
          updatedAt: vesselGroups.updatedAt,
        })
        .from(vesselGroups)
        .leftJoin(vessels, eq(vesselGroups.id, vessels.groupId))
        .where(or(groupSearchCondition, vesselSearchCondition))
        .groupBy(
          vesselGroups.id,
          vesselGroups.groupName,
          vesselGroups.createdAt,
          vesselGroups.updatedAt
        )
        .orderBy(vesselGroups.groupName);

      console.log('Found groups with search:', allVesselGroups.length);

      // For each group, get its vessels (filtered by search if provided)
      if (pagination.all === 'true') {
        const vesselsGroupedData = await Promise.all(
          allVesselGroups.map(async (group) => {
            // Apply vessel search filter if provided
            let condition = eq(vessels.groupId, Number(group.id));
            if (searchQuery && vesselSearchCondition) {
              condition = or(condition, vesselSearchCondition) || condition;
            }

            const groupVessels = await db
              .select()
              .from(vessels)
              .where(condition)
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

        // Filter out groups that have no vessels after search
        const filteredGroups = vesselsGroupedData.filter(
          (group) => group.vessels.length > 0
        );

        return {
          success: true,
          message: 'Vessels grouped by groups fetched successfully',
          data: filteredGroups,
          pagination: {
            currentPage: 1,
            pageSize: filteredGroups.length,
            totalItems: filteredGroups.length,
            totalPages: 1,
          },
        };
      } else {
        const offset = (pagination.currentPage - 1) * pagination.pageSize;
        const [paginatedVesselsGrouped, totalCount] = await Promise.all([
          // Get paginated vessel groups with filtered vessels
          Promise.all(
            allVesselGroups
              .slice(offset, offset + pagination.pageSize)
              .map(async (group) => {
                // Apply vessel search filter if provided
                let condition = eq(vessels.groupId, group.id);
                if (searchQuery && vesselSearchCondition) {
                  condition = or(condition, vesselSearchCondition) || condition;
                }

                const groupVessels = await db
                  .select()
                  .from(vessels)
                  .where(condition)
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
          // Get total count of vessel groups (filtered)
          db
            .select({ count: vesselGroups.id })
            .from(vesselGroups)
            .leftJoin(vessels, eq(vesselGroups.id, vessels.groupId))
            .where(or(groupSearchCondition, vesselSearchCondition))
            .then((result) => result.length),
        ]);

        // Filter out groups that have no vessels after search for pagination
        const filteredPaginatedGroups = paginatedVesselsGrouped.filter(
          (group) => group.vessels.length > 0
        );
        const totalPages = Math.ceil(totalCount / pagination.pageSize);

        return {
          success: true,
          message: 'Vessels grouped by groups fetched successfully',
          data: filteredPaginatedGroups,
          pagination: {
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
            totalItems: totalCount,
            totalPages,
          },
        };
      }
    } else {
      // No search query - return all groups with their vessels
      const allVesselGroups = await db
        .select()
        .from(vesselGroups)
        .orderBy(vesselGroups.groupName);

      console.log('all vessel groups (no search)', allVesselGroups);

      // For each group, get its vessels
      if (pagination.all === 'true') {
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
          message: 'Vessels grouped by groups fetched successfully',
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
          message: 'Vessels grouped by groups fetched successfully',
          data: paginatedVesselsGrouped,
          pagination: {
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
            totalItems: totalCount.length,
            totalPages,
          },
        };
      }
    }
  } catch (error) {
    console.error('Error in getAllVesselsGrouped_func:', error);
    return {
      success: false,
      message: 'Failed to fetch vessels grouped by groups',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
