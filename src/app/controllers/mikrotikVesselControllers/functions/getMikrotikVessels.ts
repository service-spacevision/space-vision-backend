import { db } from '../../../db/connection';
import { vessels } from '../../../models/Vessel';
import { userRoles } from '../../../models/UserRole';
import { eq, and, count, desc, SQL, inArray, like, sql } from 'drizzle-orm';
import { IPagination } from '../../../utils/types';

interface GetMikrotikVesselsParams {
  reqObject: {
    user: any;
  };
  query?: {
    vesselName?: string;
    routerIp?: string;
  };
  pagination?: IPagination;
}

export async function getMikrotikVessels_func({
  reqObject,
  query,
  pagination,
}: GetMikrotikVesselsParams) {
  try {
    const { user } = reqObject;
    const conditions: SQL[] = [];

    // Add search conditions
    if (query?.vesselName) {
      // Add case-insensitive search using ilike
      conditions.push(
        sql`LOWER(${vessels.name}) LIKE LOWER(${'%' + query.vesselName + '%'})`
      );
    }
    if (query?.routerIp) {
      conditions.push(eq(vessels.deviceId, query.routerIp));
    }

    // Add condition to only show Mikrotik vessels
    conditions.push(eq(vessels.isMikrotik, true));

    // Check if user is a system user
    const userWithRole = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, user.id),
      with: {
        role: true,
      },
    });

    // If user is not a system user, filter by permitted vessel groups
    if (userWithRole?.role && !userWithRole.role.isSystem) {
      const permittedVesselGroups =
        userWithRole.role.permittedVesselGroups || [];
      if (permittedVesselGroups.length > 0) {
        conditions.push(inArray(vessels.groupId, permittedVesselGroups));
      } else {
        // If no vessel groups are permitted, return empty result
        return {
          success: true,
          message: 'No mikrotik vessels accessible to this user',
          data: [],
          pagination: {
            total: 0,
            page: 1,
            pageSize: 0,
          },
        };
      }
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    // If pagination.all is set, return all records without pagination
    if (pagination?.all === 'true' || pagination?.all === '1') {
      const result = await db
        .select()
        .from(vessels)
        .where(whereCondition)
        .orderBy(desc(vessels.createdAt));

      return {
        success: true,
        message: 'Mikrotik vessels retrieved successfully',
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
      .from(vessels)
      .where(whereCondition);

    const total = totalResult.count;

    // Get paginated data
    const result = await db
      .select()
      .from(vessels)
      .where(whereCondition)
      .orderBy(desc(vessels.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      success: true,
      message: 'Mikrotik vessels retrieved successfully',
      data: result,
      pagination: {
        total,
        page,
        pageSize,
      },
    };
  } catch (error: any) {
    console.error('Error fetching mikrotik vessels:', error);
    return {
      success: false,
      message: 'Failed to fetch mikrotik vessels',
      error: error.message,
    };
  }
}
