import { db } from "../../../db/connection";
import { userRoles } from "../../../models/UserRole";
import { permissions } from "../../../models/Permission";
import { rolesPermission } from "../../../models/RolePermission";
import { CreateUserRoleData } from "../../../models/UserRole";
import { inArray } from "drizzle-orm";
import { AuthUser } from "../../../utils/types";

interface CreateUserRoleParams {
  data: CreateUserRoleData & {
    permissions?: number[]; // Array of permission IDs
  };
  user: AuthUser;
}

export async function createUserRole_func({
  data,
  user,
}: CreateUserRoleParams) {
  try {
    // const orgId: string | null =
    //   user?.organizationId != null
    //     ? String(user.organizationId)
    //     : (data?.organizationId ?? null);

    const [newRole] = await db
      .insert(userRoles)
      .values({
        name: `${data.name}`,
        displayName: data.displayName,
        description: data.description,
        createdBy: user?.id,
        organizationId: user?.organizationId || data?.organizationId || null,
        permittedVesselGroups: data.permittedVesselGroups || [],
      })
      .returning();

    // If permissions array is provided, handle role-permission associations
    if (data.permissions && data.permissions.length > 0) {
      // Fetch all permissions by IDs
      const fetchedPermissions = await db
        .select()
        .from(permissions)
        .where(inArray(permissions.id, data.permissions));

      // Group permissions by category
      const apiPermissions: string[] = [];
      const componentPermissions: string[] = [];
      const navigationPermissions: string[] = [];

      fetchedPermissions.forEach((permission) => {
        switch (permission.category) {
          case "api":
            apiPermissions.push(permission.name);
            break;
          case "component":
            componentPermissions.push(permission.name);
            break;
          case "navigation":
            navigationPermissions.push(permission.name);
            break;
        }
      });

      // Create role-permission association
      await db.insert(rolesPermission).values({
        roleId: newRole.id,
        api_permissions: apiPermissions.length > 0 ? apiPermissions : null,
        component_permissions:
          componentPermissions.length > 0 ? componentPermissions : null,
        navigation_permissions:
          navigationPermissions.length > 0 ? navigationPermissions : null,
      });
    }

    return {
      success: true,
      message: "User role created successfully",
      data: newRole,
    };
  } catch (error: any) {
    console.error("Error creating user role:", error);

    if (error.code === "23505") {
      // Unique constraint violation
      return {
        success: false,
        message: "Role name already exists",
      };
    }

    return {
      success: false,
      message: "Failed to create user role",
    };
  }
}
