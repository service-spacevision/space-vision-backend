import { db } from "../../../db/connection";
import { userRoles } from "../../../models/UserRole";
import { eq } from "drizzle-orm";
import { users } from "../../../models/User";

interface DeleteGroupAccessParams {
  reqObject: {
    user: any;
  };
  query: {
    role: string;
  };
}

export async function deleteGroupAccess_func({
  reqObject,
  query,
}: DeleteGroupAccessParams) {
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
        message: "Unauthorized: Only admin users can delete group access",
      };
    }

    if (!query.role) {
      return {
        success: false,
        message: "Role ID is required",
      };
    }

    const roleId = parseInt(query.role);
    if (isNaN(roleId)) {
      return {
        success: false,
        message: "Invalid role ID",
      };
    }

    // Clear the permitted_vessel_groups array for this role
    await db
      .update(userRoles)
      .set({
        permittedVesselGroups: [],
        updatedAt: new Date(),
      })
      .where(eq(userRoles.id, roleId));

    return {
      success: true,
      message: `Successfully cleared permitted vessel groups for role ${roleId}`,
    };
  } catch (error: any) {
    console.error("Error deleting group access:", error);
    return {
      success: false,
      message: "Failed to delete group access",
      error: error.message,
    };
  }
}
