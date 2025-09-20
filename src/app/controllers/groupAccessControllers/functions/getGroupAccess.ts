import { db } from "../../../db/connection";
import { userRoles } from "../../../models/UserRole";
import { vesselGroups } from "../../../models/VesselGroup";
import { eq } from "drizzle-orm";
import { IPagination } from "../../../utils/types";

interface GetGroupAccessParams {
  reqObject: {
    user: any;
  };
  query?: {
    role?: string;
    groupId?: string;
  };
  pagination?: IPagination;
}

export async function getGroupAccess_func({
  reqObject,
  query,
  pagination,
}: GetGroupAccessParams) {
  try {
    const { user } = reqObject;

    // Get the user with their role
    const userWithRole = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, user.id),
      with: {
        role: true,
      },
    });

    // Check if user has admin role
    if (!userWithRole?.role || userWithRole.role.name !== "admin") {
      return {
        success: false,
        message: "Unauthorized: Only admin users can access this resource",
      };
    }

    // Get all vessel groups
    const allVesselGroups = await db.select().from(vesselGroups);

    // Get role with allowed groups
    const roleId = query?.role ? parseInt(query.role) : undefined;

    if (!roleId) {
      return {
        success: false,
        message: "Role ID is required",
      };
    }

    const role = await db.query.userRoles.findFirst({
      where: eq(userRoles.id, roleId),
      columns: {
        id: true,
        name: true,
        permittedVesselGroups: true,
        displayName: true,
        description: true,
        isActive: true,
        isSystem: true,
      },
    });

    if (!role) {
      return {
        success: false,
        message: "Role not found",
      };
    }

    // Create a set of allowed group IDs for this role from permittedVesselGroups
    const allowedGroupIds = new Set<number>(role.permittedVesselGroups || []);

    // Prepare response with isAllowed flag for all groups
    const allGroupsWithAccess = allVesselGroups.map((group) => ({
      ...group,
      isAllowed: allowedGroupIds.has(group.id) ? 1 : 0,
    }));

    // If pagination.all is set, return all records without pagination
    if (pagination?.all === "true" || pagination?.all === "1") {
      return {
        success: true,
        message: "Group access retrieved successfully",
        data: allGroupsWithAccess,
        pagination: {
          total: allGroupsWithAccess.length,
          page: 1,
          pageSize: allGroupsWithAccess.length,
        },
      };
    }

    // Default pagination values
    const page = pagination?.currentPage || 1;
    const pageSize = pagination?.pageSize || 10;
    const offset = (page - 1) * pageSize;

    // Apply pagination
    const paginatedGroups = allGroupsWithAccess.slice(
      offset,
      offset + pageSize
    );

    return {
      success: true,
      message: "Group access retrieved successfully",
      data: paginatedGroups,
      pagination: {
        total: allGroupsWithAccess.length,
        page,
        pageSize,
        totalPages: Math.ceil(allGroupsWithAccess.length / pageSize),
      },
    };
  } catch (error: any) {
    console.error("Error fetching group access:", error);
    return {
      success: false,
      message: "Failed to fetch group access",
      error: error.message,
    };
  }
}
