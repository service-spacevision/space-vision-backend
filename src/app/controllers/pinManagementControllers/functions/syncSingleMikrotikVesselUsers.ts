import { and, eq, isNotNull } from 'drizzle-orm';
import { createMikrotikConnection } from '../../../utils/mikrotikAPI';
import { mikrotikPermissions } from '../../../models/MikrotikPermission';
import { mikrotikVessels } from '../../../models/MikrotikVessel';
import { db } from '../../../db/connection';
import { numeric } from 'drizzle-orm/pg-core';
import { SyncMikrotikUsersResult } from './syncMikrotikUsers';

export async function syncSingleMikrotikVesselUsers(
  vesselId: number
): Promise<SyncMikrotikUsersResult> {
  try {
    // Get the specific MikroTik vessel
    const vessel = await db
      .select({
        id: mikrotikVessels.id,
        vesselName: mikrotikVessels.vesselName,
        routerIp: mikrotikVessels.routerIp,
        apiPort: mikrotikVessels.apiPort,
      })
      .from(mikrotikVessels)
      .where(eq(mikrotikVessels.id, vesselId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!vessel || !vessel.routerIp || !vessel.apiPort) {
      return {
        success: false,
        message: 'Vessel not found or invalid router configuration',
      };
    }

    console.log(
      `🔍 Syncing users from vessel: ${vessel.vesselName} (${vessel.routerIp}:${vessel.apiPort})`
    );

    // Connect to MikroTik router
    const mikrotikAPI = await createMikrotikConnection(
      vessel.routerIp,
      vessel.apiPort,
      false,
      'api'
    );

    // Test connection
    const connectionTest = await mikrotikAPI.testConnection();
    if (!connectionTest.reachable || !connectionTest.apiAvailable) {
      return {
        success: false,
        message: `Router not reachable or API not available for vessel ${vessel.vesselName}`,
      };
    }

    // Get all hotspot users
    const users = await mikrotikAPI.getHotspotUsers();
    console.log(
      `📊 Found ${users.length} users on vessel ${vessel.vesselName}`
    );

    // Delete existing permissions for this vessel
    await db
      .delete(mikrotikPermissions)
      .where(eq(mikrotikPermissions.vesselId, vessel.id));

    // Filter and map users to permissions
    const newPermissions = users
      .filter(
        (user: any) =>
          user.name && user.password && user.name !== 'default-trial'
      )
      .map((user: any) => ({
        vesselId: vessel.id,
        vesselName: vessel.vesselName,
        mikrotikUserName: user.name || '',
        routerIp: vessel.routerIp || '0.0.0.0',
        routerPort: vessel.apiPort || 0,
        organizationId: 10,
        type: 'crew',
        username: user.name || '',
        password: user.password || '',
        profile: user.profile || '',
        server: user.server || '',
        limitBytesTotal: user['limit-bytes-total']
          ? user['limit-bytes-total']
          : 0,
        assignedById: user.assignedById || 1,
      }));

    // Insert new permissions if any
    if (newPermissions.length > 0) {
      await db.insert(mikrotikPermissions).values(newPermissions);
    }

    console.log(
      `✅ Synced ${newPermissions.length} users from ${vessel.vesselName}`
    );

    return {
      success: true,
      message: `Successfully synced ${newPermissions.length} users from ${vessel.vesselName}`,
      syncedVessels: [
        {
          id: vessel.id,
          name: vessel.vesselName,
          usersSynced: newPermissions.length,
        },
      ],
    };
  } catch (error) {
    console.error('❌ Error in syncSingleMikrotikVesselUsers:', error);
    return {
      success: false,
      message: 'Failed to sync MikroTik users for vessel',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
