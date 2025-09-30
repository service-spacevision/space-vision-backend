import { db } from "../../../db/connection";
import { eq, and } from "drizzle-orm";
import { mikrotikPermissions } from "../../../models/MikrotikPermission";
import { getMikrotikUsageByVesselId } from "./getMikrotikUsageByVesselId";

export async function crewLogin({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  try {
    // Find the user in mikrotik_permissions
    const [permission] = await db
      .select()
      .from(mikrotikPermissions)
      .where(
        and(
          eq(mikrotikPermissions.username, username),
          eq(mikrotikPermissions.password, password)
        )
      )
      .limit(1);

    if (!permission) {
      return {
        success: false,
        status: 401,
        message: "Invalid credentials",
      };
    }

    // If mikrotik_user_name is set, filter by it, otherwise return all data for the vessel
    const usernameFilter = permission.mikrotikUserName || undefined;

    // Get current session data
    const currentSession = await getMikrotikUsageByVesselId({
      vesselId: permission.vesselId,
      mode: 'current-session',
      username: usernameFilter, // This will filter by mikrotik_username if it exists
      currentPage: '1',
      pageSize: '1000',
    });

    // Get all-time data
    const allTime = await getMikrotikUsageByVesselId({
      vesselId: permission.vesselId,
      mode: 'all-time',
      username: usernameFilter, // This will filter by mikrotik_username if it exists
      currentPage: '1',
      pageSize: '1000',
    });

    return {
      success: true,
      data: {
        vesselId: permission.vesselId,
        vesselName: permission.vesselName,
        currentSession: currentSession.data || [],
        allTime: allTime.data || [],
        routerInfo: {
          ip: permission.routerIp,
          port: permission.routerPort,
          mikrotikUserName: permission.mikrotikUserName,
        },
      },
    };
  } catch (error) {
    console.error("Error in crew login:", error);
    return {
      success: false,
      status: 500,
      message: "Failed to process login",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
