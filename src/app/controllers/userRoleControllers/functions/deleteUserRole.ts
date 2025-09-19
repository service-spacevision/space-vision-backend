import { db } from "../../../db/connection";
import { userRoles, users } from "../../../db/schema";
import { eq, count } from "drizzle-orm";

interface DeleteUserRoleParams {
  roleId: string;
}

export async function deleteUserRole_func({ roleId }: DeleteUserRoleParams) {
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
        message: "Cannot delete system roles",
      };
    }

    // Check if any users are assigned to this role
    const [userCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.roleId, Number(roleId)));

    if (userCount.count > 0) {
      return {
        success: false,
        message: `Cannot delete role. ${userCount.count} user(s) are assigned to this role`,
      };
    }

    await db.delete(userRoles).where(eq(userRoles.id, Number(roleId)));

    return {
      success: true,
      message: "User role deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting user role:", error);

    return {
      success: false,
      message: "Failed to delete user role",
    };
  }
}
