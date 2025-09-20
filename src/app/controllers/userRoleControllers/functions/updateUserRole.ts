import { db } from "../../../db/connection";
import { userRoles } from "../../../models/UserRole";
import { UpdateUserRoleData } from "../../../models/UserRole";
import { eq } from "drizzle-orm";

interface UpdateUserRoleParams {
  roleId: string;
  data: UpdateUserRoleData;
}

export async function updateUserRole_func({
  roleId,
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

    if (existingRole.isSystem) {
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
