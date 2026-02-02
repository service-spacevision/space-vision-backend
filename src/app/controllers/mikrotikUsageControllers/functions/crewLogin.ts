import { db } from '../../../db/connection';
import { eq, and } from 'drizzle-orm';
import { mikrotikPermissions } from '../../../models/MikrotikPermission';
import { getMikrotikUsageByVesselId } from './getMikrotikUsageByVesselId';

export async function crewLogin({
  username,
  password,
  type,
}: {
  username: string;
  password: string;
  type?: 'crew' | 'system';
}) {
  try {
    // Find the user in mikrotik_permissions
    console.log('username', username);
    console.log('password', password);
    console.log('type', type);
    const [permission] = await db
      .select()
      .from(mikrotikPermissions)
      .where(
        and(
          eq(mikrotikPermissions.username, username),
          eq(mikrotikPermissions.password, password),
          type ? eq(mikrotikPermissions.type, type) : undefined
        )
      )
      .limit(1);

    if (!permission) {
      return {
        success: false,
        status: 401,
        message: 'Invalid credentials',
      };
    }

    const usernameFilter = type === 'crew' ? username : undefined;

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
    console.error('Error in crew login:', error);
    return {
      success: false,
      status: 500,
      message: 'Failed to process login',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
