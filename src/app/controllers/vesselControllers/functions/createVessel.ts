import { db } from '../../../db/connection';
import { vessels, vesselGroups, mikrotikVessels } from '../../../db/schema';
import { eq } from 'drizzle-orm';

const DEFAULT_ROUTER_IP = '0.0.0.0';

interface CreateVesselParams {
  reqObject: {
    user: any;
  };
  data: {
    vesselsKitNumber: string;
    name?: string;
    subscriptionPlan?: string;
    groupId?: number;
    deviceId?: string;
    apiPort?: number;
    isMikrotik?: boolean;
    routerIp?: string;
    isActive?: boolean;
  };
}

export async function createVessel_func({
  reqObject,
  data,
}: CreateVesselParams) {
  try {
    // Validate required fields
    if (!data.vesselsKitNumber) {
      return {
        success: false,
        message: 'Vessel kit number is required',
      };
    }

    const isMikrotik = data.isMikrotik;
    if (isMikrotik == true && !data.name) {
      return {
        success: false,
        message: 'Vessel name is required when creating a Mikrotik vessel',
      };
    }

    // Check if vessel kit number already exists
    const existingVessel = await db
      .select()
      .from(vessels)
      .where(eq(vessels.vesselsKitNumber, data.vesselsKitNumber))
      .limit(1);

    if (existingVessel.length > 0) {
      return {
        success: false,
        message: 'Vessel with this kit number already exists',
      };
    }

    // Validate group exists if groupId is provided
    if (data.groupId) {
      const existingGroup = await db
        .select()
        .from(vesselGroups)
        .where(eq(vesselGroups.id, data.groupId))
        .limit(1);

      if (existingGroup.length === 0) {
        return {
          success: false,
          message: 'Vessel group not found',
        };
      }
    }

    const routerIp = data.routerIp?.trim() || DEFAULT_ROUTER_IP;

    console.log('data', data);
    console.log(
      'isMikrotik value/type:',
      data.isMikrotik,
      typeof data.isMikrotik
    );

    const newVessel = await db.transaction(async (tx) => {
      const [createdVessel] = await tx
        .insert(vessels)
        .values({
          vesselsKitNumber: data.vesselsKitNumber,
          name: data.name,
          subscriptionPlan: data.subscriptionPlan,
          groupId: data.groupId,
          deviceId: data.deviceId,
          apiPort: data.apiPort,
          isMikrotik: data.isMikrotik,
          isActive: data.isActive,
        })
        .returning();

      if (isMikrotik) {
        const vesselName = createdVessel.name;

        if (!vesselName) {
          throw new Error('Mikrotik vessels require a vessel name');
        }

        const [existingMikrotik] = await tx
          .select({
            id: mikrotikVessels.id,
          })
          .from(mikrotikVessels)
          .where(eq(mikrotikVessels.vesselName, vesselName))
          .limit(1);

        if (existingMikrotik) {
          await tx
            .update(mikrotikVessels)
            .set({
              routerIp,
              apiPort: data.apiPort ?? null,
              updatedAt: new Date(),
              vesselName,
            })
            .where(eq(mikrotikVessels.id, existingMikrotik.id));
        } else {
          await tx.insert(mikrotikVessels).values({
            vesselName,
            routerIp,
            apiPort: data.apiPort ?? null,
          });
        }
      }

      return createdVessel;
    });

    return {
      success: true,
      message: 'Vessel created successfully',
      data: newVessel,
    };
  } catch (error) {
    console.error('Error in createVessel_func:', error);
    return {
      success: false,
      message: 'Failed to create vessel',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
