import { db } from '../../../db/connection';
import { userRoles } from '../../../models/UserRole';
import { mikrotikVessels } from '../../../models/MikrotikVessel';
import { eq } from 'drizzle-orm';
import { IPagination } from '../../../utils/types';

interface GetMikrotikVesselAccessParams {
  reqObject: {
    user: any;
  };
  query?: {
    role?: string;
    vesselId?: string;
  };
  pagination?: IPagination;
}

export async function getMikrotikVesselAccess_func({
  reqObject,
  query,
  pagination,
}: GetMikrotikVesselAccessParams) {
  try {
    const { user } = reqObject;

    // Optional: ensure requesting user exists with role (mirrors group access logic)
    await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, user.id),
      with: {
        role: true,
      },
    });

    const allMikrotikVessels = await db.select().from(mikrotikVessels);

    const roleId = query?.role ? parseInt(query.role, 10) : undefined;
    if (!roleId) {
      return {
        success: false,
        message: 'Role ID is required',
      };
    }

    const role = await db.query.userRoles.findFirst({
      where: eq(userRoles.id, roleId),
      columns: {
        id: true,
        name: true,
        permittedMikrotikVessels: true,
        displayName: true,
        description: true,
        isActive: true,
        isSystem: true,
      },
    });

    if (!role) {
      return {
        success: false,
        message: 'Role not found',
      };
    }

    const allowedVesselIds = new Set<number>(
      role.permittedMikrotikVessels || []
    );

    const allVesselWithAccess = allMikrotikVessels.map((vessel) => {
      const vesselId = Number(vessel.id);

      return {
        ...vessel,
        isAllowed: allowedVesselIds.has(vesselId) ? 1 : 0,
      };
    });

    if (pagination?.all === 'true' || pagination?.all === '1') {
      return {
        success: true,
        message: 'Mikrotik vessel access retrieved successfully',
        data: allVesselWithAccess,
        pagination: {
          total: allVesselWithAccess.length,
          page: 1,
          pageSize: allVesselWithAccess.length,
        },
      };
    }

    const page = pagination?.currentPage || 1;
    const pageSize = pagination?.pageSize || 10;
    const offset = (page - 1) * pageSize;

    const paginatedVessels = allVesselWithAccess.slice(
      offset,
      offset + pageSize
    );

    return {
      success: true,
      message: 'Mikrotik vessel access retrieved successfully',
      data: paginatedVessels,
      pagination: {
        total: allVesselWithAccess.length,
        page,
        pageSize,
        totalPages: Math.ceil(allVesselWithAccess.length / pageSize),
      },
    };
  } catch (error: any) {
    console.error('Error fetching mikrotik vessel access:', error);
    return {
      success: false,
      message: 'Failed to fetch mikrotik vessel access',
      error: error.message,
    };
  }
}
