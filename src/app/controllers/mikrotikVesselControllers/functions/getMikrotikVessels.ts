import { db } from '../../../db/connection';
import { mikrotikVessels } from '../../../models/MikrotikVessel';
import { userRoles } from '../../../models/UserRole';
import { eq, and, count, desc, SQL, inArray } from 'drizzle-orm';
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
      conditions.push(eq(mikrotikVessels.vesselName, query.vesselName));
    }
    if (query?.routerIp) {
      conditions.push(eq(mikrotikVessels.routerIp, query.routerIp));
    }

    // Check if user is a system user
    const userWithRole = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, user.id),
      with: {
        role: true,
      },
    });

    // If user is not a system user, filter by permitted_mikrotik_vessels
    if (userWithRole?.role && !userWithRole.role.isSystem) {
      const permittedVessels = userWithRole.role.permittedMikrotikVessels || [];
      if (permittedVessels.length > 0) {
        conditions.push(inArray(mikrotikVessels.id, permittedVessels));
      } else {
        // If no vessels are permitted, return empty result
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
        .from(mikrotikVessels)
        .where(whereCondition)
        .orderBy(desc(mikrotikVessels.createdAt));

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
      .from(mikrotikVessels)
      .where(whereCondition);

    const total = totalResult.count;

    // Get paginated data
    const result = await db
      .select()
      .from(mikrotikVessels)
      .where(whereCondition)
      .orderBy(desc(mikrotikVessels.createdAt))
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
