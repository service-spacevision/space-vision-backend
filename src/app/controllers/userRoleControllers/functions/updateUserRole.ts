import { db } from "../../../db/connection";
import { userRoles } from "../../../models/UserRole";
import { UpdateUserRoleData } from "../../../models/UserRole";
import { permissions } from '../../../models/Permission'
import { rolesPermission } from '../../../models/RolePermission'
import { eq, inArray } from "drizzle-orm";
import { AuthUser } from "../../../utils/types";

interface UpdateUserRoleParams {
  roleId: string;
  userInfo: AuthUser;
  data: UpdateUserRoleData & {
    permissions?: number[] // Array of permission IDs
  };
}

export async function updateUserRole_func({
  roleId,
  userInfo,
  data,
}: UpdateUserRoleParams) {
  try {
    // Check if role exists and is not a system role
    const [existingRole] = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.id, Number(roleId)))
      .limit(1);

    if (!existingRole) {
      return {
        success: false,
        message: "User role not found",
      };
    }

    if (existingRole.isSystem && !userInfo.role?.isSystem) {
      return {
        success: false,
        message: "Cannot modify system roles",
      };
    }

    const [updatedRole] = await db
      .update(userRoles)
      .set({
        displayName: data.displayName,
        description: data.description,
        isActive: (data as any).isActive,
        organizationId: (data as any).organizationId,
        updatedAt: new Date(),
      })
      .where(eq(userRoles.id, Number(roleId)))
      .returning();

    // If permissions array is provided, update role-permission associations
    if (data.permissions !== undefined) {
      if (data.permissions.length > 0) {
        console.log("permissions up", data.permissions);
        
        // Fetch all permissions by IDs
        const fetchedPermissions = await db
          .select()
          .from(permissions)
          .where(inArray(permissions.id, data.permissions))
        console.log("permissions up", fetchedPermissions);
        
        // Group permissions by category
        const apiPermissions: string[] = []
        const componentPermissions: string[] = []
        const navigationPermissions: string[] = []

        fetchedPermissions.forEach(permission => {
          switch (permission.category) {
            case 'api':
              apiPermissions.push(permission.name)
              break
            case 'component':
              componentPermissions.push(permission.name)
              break
            case 'navigation':
              navigationPermissions.push(permission.name)
              break
          }
        })

        // Update or insert role-permission association
        const updatedData = await db
          .insert(rolesPermission)
          .values({
            roleId: Number(roleId),
            api_permissions: apiPermissions.length > 0 ? apiPermissions : null,
            component_permissions: componentPermissions.length > 0 ? componentPermissions : null,
            navigation_permissions: navigationPermissions.length > 0 ? navigationPermissions : null,
          })
          .onConflictDoUpdate({
            target: rolesPermission.roleId,
            set: {
              api_permissions: apiPermissions.length > 0 ? apiPermissions : null,
              component_permissions: componentPermissions.length > 0 ? componentPermissions : null,
              navigation_permissions: navigationPermissions.length > 0 ? navigationPermissions : null,
              updatedAt: new Date(),
            }
          })
          .returning();
          console.log("updatedData", updatedData);
          
      } else {
        console.log("permissions", data.permissions);
        
        // If empty permissions array, clear all permissions for this role
        await db
          .insert(rolesPermission)
          .values({
            roleId: Number(roleId),
            api_permissions: null,
            component_permissions: null,
            navigation_permissions: null,
          })
          .onConflictDoUpdate({
            target: rolesPermission.roleId,
            set: {
              api_permissions: null,
              component_permissions: null,
              navigation_permissions: null,
              updatedAt: new Date(),
            }
          })
      }
    }

    return {
      success: true,
      message: "User role updated successfully",
      data: updatedRole,
    };
  } catch (error: any) {
    console.error("Error updating user role:", error);

    return {
      success: false,
      message: "Failed to update user role",
    };
  }
}
