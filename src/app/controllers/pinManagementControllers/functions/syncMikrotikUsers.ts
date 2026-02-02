import { and, eq, isNotNull } from 'drizzle-orm';
import { createMikrotikConnection } from '../../../utils/mikrotikAPI';
import { mikrotikPermissions } from '../../../models/MikrotikPermission';
import { mikrotikVessels } from '../../../models/MikrotikVessel';
import { db } from '../../../db/connection';
import { numeric } from 'drizzle-orm/pg-core';

export interface SyncMikrotikUsersResult {
  success: boolean;
  message: string;
  syncedVessels?: {
    id: number;
    name: string;
    usersSynced: number;
  }[];
  error?: string;
}



export async function syncMikrotikUsers_func(): Promise<SyncMikrotikUsersResult> {
  try {
    // Get all MikroTik vessels with valid router IP and API port
    const vessels = await db
      .select({
        id: mikrotikVessels.id,
        vesselName: mikrotikVessels.vesselName,
        routerIp: mikrotikVessels.routerIp,
        apiPort: mikrotikVessels.apiPort,
      })
      .from(mikrotikVessels)
      .where(
        and(
          isNotNull(mikrotikVessels.routerIp),
          isNotNull(mikrotikVessels.apiPort)
        )
      );

    if (vessels.length === 0) {
      return {
        success: false,
        message: 'No MikroTik vessels found with valid router configuration',
      };
    }

    const results = [];

    // Process each vessel
    for (const vessel of vessels) {
      if (!vessel.routerIp || !vessel.apiPort) continue; // Shouldn't happen due to query filter

      try {
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
          console.warn(
            `❌ Skipping vessel ${vessel.vesselName} - router not reachable or API not available`
          );
          continue;
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

        results.push({
          id: vessel.id,
          name: vessel.vesselName,
          usersSynced: newPermissions.length,
        });
      } catch (error) {
        console.error(`❌ Error syncing vessel ${vessel.vesselName}:`, error);
        // Continue with next vessel even if one fails
      }
    }

    return {
      success: true,
      message: `Successfully synced users from ${results.length} vessels`,
      syncedVessels: results,
    };
  } catch (error) {
    console.error('❌ Error in syncMikrotikUsers_func:', error);
    return {
      success: false,
      message: 'Failed to sync MikroTik users',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
