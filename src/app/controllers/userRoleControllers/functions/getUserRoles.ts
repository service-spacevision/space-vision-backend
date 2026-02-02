import { db } from "../../../db/connection";
import { userRoles } from "../../../models/UserRole";
import { rolesPermission } from "../../../models/RolePermission";
import { eq, desc, count, or, ilike, and } from "drizzle-orm";
import { IPagination } from "../../../utils/types";

interface GetUserRolesParams {
  includeInactive?: boolean;
  pagination?: IPagination;
  searchQuery?: string;
}

export async function getUserRoles_func({
  includeInactive = false,
  pagination,
  searchQuery = '',
}: GetUserRolesParams = {}) {
  try {
    // Build where conditions
    const whereConditions = [];

    // Add search conditions if searchQuery is provided
    if (searchQuery) {
      const searchTerm = `%${searchQuery}%`;
      whereConditions.push(
        or(
          ilike(userRoles.name, searchTerm),
          ilike(userRoles.displayName, searchTerm)
        )
      );
    }

    // Add active/inactive condition
    if (!includeInactive) {
      whereConditions.push(eq(userRoles.isActive, true));
    }

    const whereCondition = whereConditions.length > 1
      ? and(...whereConditions)
      : whereConditions.length === 1
        ? whereConditions[0]
        : undefined;

    // If pagination.all is set, return all records without pagination
    if (pagination?.all === "true" || pagination?.all === "1") {
      const rolesData = await db
        .select({
          id: userRoles.id,
          name: userRoles.name,
          displayName: userRoles.displayName,
          description: userRoles.description,
          isActive: userRoles.isActive,
          isSystem: userRoles.isSystem,
          created_by: userRoles.createdBy,
          organizationName: userRoles.organizationName,
          permittedVesselGroups: userRoles.permittedVesselGroups,
          organization_id: userRoles.organizationId,
          createdAt: userRoles.createdAt,
          updatedAt: userRoles.updatedAt,
          api_permissions: rolesPermission.api_permissions,
          component_permissions: rolesPermission.component_permissions,
          navigation_permissions: rolesPermission.navigation_permissions,
        })
        .from(userRoles)
        .leftJoin(rolesPermission, eq(userRoles.id, rolesPermission.roleId))
        .where(whereCondition)
        .orderBy(desc(userRoles.createdAt));

      // Transform the data to have nested permissions structure
      const roles = rolesData.map(role => ({
        ...role,
        permissions: {
          api_permissions: role.api_permissions,
          component_permissions: role.component_permissions,
          navigation_permissions: role.navigation_permissions,
        },
        // Remove the flat permission fields
        api_permissions: undefined,
        component_permissions: undefined,
        navigation_permissions: undefined,
      }));

      return {
        success: true,
        message: "User roles retrieved successfully",
        data: roles,
        pagination: {
          total: roles.length,
          page: 1,
          pageSize: roles.length,
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
      .from(userRoles)
      .where(whereCondition);

    const total = totalResult.count;

    // Get paginated data
    const rolesData = await db
      .select({
        id: userRoles.id,
        name: userRoles.name,
        displayName: userRoles.displayName,
        description: userRoles.description,
        isActive: userRoles.isActive,
        isSystem: userRoles.isSystem,
        created_by: userRoles.createdBy,
        organizationName: userRoles.organizationName,
        permittedVesselGroups: userRoles.permittedVesselGroups,
        organization_id: userRoles.organizationId,
        createdAt: userRoles.createdAt,
        updatedAt: userRoles.updatedAt,
        api_permissions: rolesPermission.api_permissions,
        component_permissions: rolesPermission.component_permissions,
        navigation_permissions: rolesPermission.navigation_permissions,
      })
      .from(userRoles)
      .leftJoin(rolesPermission, eq(userRoles.id, rolesPermission.roleId))
      .where(whereCondition)
      .orderBy(desc(userRoles.createdAt))
      .limit(pageSize)
      .offset(offset);

    // Transform the data to have nested permissions structure
    const roles = rolesData.map(role => ({
      ...role,
      permissions: {
        api_permissions: role.api_permissions,
        component_permissions: role.component_permissions,
        navigation_permissions: role.navigation_permissions,
      },
      // Remove the flat permission fields
      api_permissions: undefined,
      component_permissions: undefined,
      navigation_permissions: undefined,
    }));

    return {
      success: true,
      message: "User roles retrieved successfully",
      data: roles,
      pagination: {
        total,
        page,
        pageSize,
      },
    };
  } catch (error: any) {
    console.error("Error fetching user roles:", error);

    return {
      success: false,
      message: "Failed to fetch user roles",
    };
  }
}
