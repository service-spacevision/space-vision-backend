import { createMikrotikConnection } from '../../../utils/mikrotikAPI';
import { db } from '../../../db/connection';
import { mikrotikVessels } from '../../../models/MikrotikVessel';
import { eq } from 'drizzle-orm';
import { HotspotUser } from '../../../utils/mikrotikAPI';

export interface ListMikrotikUsersParams {
  vessel_id: number;
  server_name?: string;
  profile?: string;
  limit?: number;
}

export interface TestMikrotikConnectionParams {
  vessel_id: number;
}

export async function testMikrotikConnection_func({ vessel_id }: TestMikrotikConnectionParams) {
  try {
    // Get vessel details
    const [vessel] = await db
      .select({
        id: mikrotikVessels.id,
        vesselName: mikrotikVessels.vesselName,
        routerIp: mikrotikVessels.routerIp,
        apiPort: mikrotikVessels.apiPort,
      })
      .from(mikrotikVessels)
      .where(eq(mikrotikVessels.id, vessel_id))
      .limit(1);

    if (!vessel) {
      return {
        success: false,
        message: 'Vessel not found',
      };
    }

    if (!vessel.routerIp || !vessel.apiPort) {
      return {
        success: false,
        message: 'Vessel router configuration not found',
      };
    }

    console.log(`🔍 Testing connection to MikroTik router at ${vessel.routerIp}:${vessel.apiPort} for vessel ${vessel.vesselName}`);

    // Test connection with detailed diagnostics
    const mikrotikAPI = await createMikrotikConnection(vessel.routerIp, vessel.apiPort, false, 'api');
    const connectionTest = await mikrotikAPI.testConnection();

    let connectionDetails: any = {
      vessel: {
        id: vessel.id,
        name: vessel.vesselName,
        routerIp: vessel.routerIp,
        apiPort: vessel.apiPort,
      },
      connectionTest,
    };

    // If basic connection works, test API functionality
    if (connectionTest.reachable && connectionTest.apiAvailable) {
      try {
        const servers = await mikrotikAPI.getHotspotServers();
        const profiles = await mikrotikAPI.getHotspotUserProfiles();

        connectionDetails = {
          ...connectionDetails,
          hotspot: {
            servers: servers.map(s => ({ name: s.name, id: s['.id'] })),
            profiles: profiles.map(p => ({ name: p.name, id: p['.id'] })),
            serverCount: servers.length,
            profileCount: profiles.length,
          }
        };

        return {
          success: true,
          message: 'MikroTik router connection successful',
          data: connectionDetails,
        };
      } catch (error) {
        return {
          success: true,
          message: 'Router reachable but API functionality limited',
          data: {
            ...connectionDetails,
            error: error instanceof Error ? error.message : 'Unknown API error',
          },
        };
      }
    }

    return {
      success: false,
      message: 'MikroTik router connection failed',
      data: connectionDetails,
    };
  } catch (error) {
    console.error('Error testing MikroTik connection:', error);
    return {
      success: false,
      message: 'Failed to test MikroTik connection',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function listMikrotikUsers_func({ vessel_id, server_name, profile, limit = 200 }: ListMikrotikUsersParams) {
  try {
    // Get vessel details
    const [vessel] = await db
      .select({
        id: mikrotikVessels.id,
        vesselName: mikrotikVessels.vesselName,
        routerIp: mikrotikVessels.routerIp,
        apiPort: mikrotikVessels.apiPort,
      })
      .from(mikrotikVessels)
      .where(eq(mikrotikVessels.id, vessel_id))
      .limit(1);

    if (!vessel) {
      return {
        success: false,
        message: 'Vessel not found',
      };
    }

    if (!vessel.routerIp || !vessel.apiPort) {
      return {
        success: false,
        message: 'Vessel router configuration not found',
      };
    }

    console.log(`🔌 Connecting to MikroTik router at ${vessel.routerIp}:${vessel.apiPort} for vessel ${vessel.vesselName}`);

    // Connect to MikroTik router
    const mikrotikAPI = await createMikrotikConnection(vessel.routerIp, vessel.apiPort, false, 'api');

    if (!(await mikrotikAPI.connect())) {
      return {
        success: false,
        message: 'Failed to connect to MikroTik router',
      };
    }

    // Get hotspot users
    const users: HotspotUser[] = await mikrotikAPI.getHotspotUsers(server_name, profile, limit);

    // Also get user profiles and servers for context
    const profiles = await mikrotikAPI.getHotspotUserProfiles();
    const servers = await mikrotikAPI.getHotspotServers();

    // Close connection
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay before disconnect

    console.log(`✅ Retrieved ${users.length} hotspot users from ${vessel.vesselName}`);

    return {
      success: true,
      message: `${users.length} hotspot users retrieved successfully`,
      data: {
        vessel: {
          id: vessel.id,
          name: vessel.vesselName,
          routerIp: vessel.routerIp,
          apiPort: vessel.apiPort,
        },
        users,
        metadata: {
          profiles: profiles.map(p => ({ name: p.name, id: p['.id'] })),
          servers: servers.map(s => ({ name: s.name, id: s['.id'] })),
          totalCount: users.length,
        },
      },
    };
  } catch (error) {
    console.error('Error listing MikroTik users:', error);
    return {
      success: false,
      message: 'Failed to retrieve hotspot users',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
