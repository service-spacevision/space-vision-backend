import { eq } from 'drizzle-orm';
import { MikrotikAPI } from '../../../../app/utils/mikrotikAPI';
import { db } from '../../../db/connection';
import { mikrotikVessels } from '../../../models/MikrotikVessel';

export interface GetVesselProfilesAndServersParams {
  reqObject: {
    user: any;
  };
  query: {
    vesselId: string;
  };
}

export async function getVesselProfilesAndServers_func({
  reqObject,
  query,
}: GetVesselProfilesAndServersParams) {
  try {
    const { vesselId } = query;

    if (!vesselId) {
      return {
        success: false,
        message: 'Vessel ID is required',
      };
    }

    console.log(`🔍 Fetching vessel with ID: ${vesselId}`);

    // Get vessel details
    const [vessel] = await db
      .select()
      .from(mikrotikVessels)
      .where(eq(mikrotikVessels.id, parseInt(vesselId)))
      .limit(1);

    if (!vessel) {
      console.log('❌ Vessel not found in database');
      return {
        success: false,
        message: 'Vessel not found',
      };
    }

    console.log(
      `🔌 Connecting to MikroTik router at ${vessel.routerIp}:${vessel.apiPort} for vessel ${vessel.vesselName}`
    );

    // Connect to MikroTik router
    const mikrotikApi = new MikrotikAPI(
      vessel.routerIp || '',
      vessel.apiPort || 8728,
      false
    );

    const isConnected = await mikrotikApi.connect();
    if (!isConnected) {
      console.log('❌ Failed to connect to MikroTik router');
      return {
        success: false,
        message: 'Failed to connect to MikroTik router',
      };
    }

    console.log(
      '✅ Connected to MikroTik router, fetching profiles and servers...'
    );

    try {
      // Get profiles and servers
      console.log('Fetching hotspot user profiles...');
      const profiles = await mikrotikApi.getHotspotUserProfiles();
      console.log(`✅ Found ${profiles.length} hotspot user profiles`);

      console.log('Fetching hotspot servers...');
      const servers = await mikrotikApi.getHotspotServers();
      console.log(`✅ Found ${servers.length} hotspot servers`);

      // Disconnect from router
      await mikrotikApi.disconnect();
      console.log('✅ Disconnected from MikroTik router');

      return {
        success: true,
        data: {
          profiles,
          servers,
          defaultProfile: profiles.length > 0 ? profiles[0].name : null,
          defaultServer: servers.length > 0 ? servers[0].name : null,
        },
      };
    } catch (error) {
      console.error('❌ Error during MikroTik operations:', error);
      try {
        await mikrotikApi.disconnect();
      } catch (e) {
        console.error('Error disconnecting from router:', e);
      }
      throw error; // Re-throw to be caught by the outer catch
    }
  } catch (error: any) {
    console.error('❌ Error in getVesselProfilesAndServers_func:', error);
    return {
      success: false,
      message: error.message || 'Failed to get vessel profiles and servers',
    };
  }
}
