import { db } from '../../../db/connection';
import { vessels, vesselGroups, mikrotikVessels } from '../../../db/schema';
import { eq, and, ne, inArray } from 'drizzle-orm';

const DEFAULT_ROUTER_IP = '0.0.0.0';

interface UpdateVesselParams {
  reqObject: {
    user: any;
  };
  query: {
    id: string;
  };
  data: {
    vesselsKitNumber?: string;
    name?: string;
    subscriptionPlan?: string;
    groupId?: number;
    deviceId?: string;
    apiPort?: number;
    isMikrotik?: boolean;
    routerIp?: string;
  };
}

export async function updateVessel_func({
  reqObject,
  query,
  data,
}: UpdateVesselParams) {
  try {
    const vesselId = parseInt(query.id);

    if (!vesselId) {
      return {
        success: false,
        message: 'Vessel ID is required',
      };
    }

    // Check if vessel exists
    const existingVessels = await db
      .select()
      .from(vessels)
      .where(eq(vessels.id, vesselId))
      .limit(1);

    if (existingVessels.length === 0) {
      return {
        success: false,
        message: 'Vessel not found',
      };
    }

    const existingVessel = existingVessels[0];

    // Check if vessel kit number already exists (excluding current vessel)
    if (data.vesselsKitNumber) {
      const duplicateVessel = await db
        .select()
        .from(vessels)
        .where(
          and(
            eq(vessels.vesselsKitNumber, data.vesselsKitNumber),
            ne(vessels.id, vesselId)
          )
        )
        .limit(1);

      if (duplicateVessel.length > 0) {
        return {
          success: false,
          message: 'Vessel with this kit number already exists',
        };
      }
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

    const finalIsMikrotik =
      typeof data.isMikrotik === 'boolean'
        ? data.isMikrotik
        : existingVessel.isMikrotik;
    const targetName = data.name ?? existingVessel.name;

    if (finalIsMikrotik && !targetName) {
      return {
        success: false,
        message: 'Vessel name is required when marking vessel as Mikrotik',
      };
    }

    const updatedVessel = await db.transaction(async (tx) => {
      const { routerIp, isMikrotik, ...rest } = data;

      const updatePayload: Record<string, unknown> = {
        ...rest,
        updatedAt: new Date(),
      };

      if (typeof isMikrotik === 'boolean') {
        updatePayload.isMikrotik = isMikrotik;
      }

      if (data.apiPort !== undefined) {
        updatePayload.apiPort = data.apiPort;
      }

      const [updated] = await tx
        .update(vessels)
        .set(updatePayload)
        .where(eq(vessels.id, vesselId))
        .returning();

      if (!updated) {
        throw new Error('Failed to update vessel');
      }

      const [existingMikrotik] = await tx
        .select({ id: mikrotikVessels.id, routerIp: mikrotikVessels.routerIp })
        .from(mikrotikVessels)
        .where(eq(mikrotikVessels.vesselName, existingVessel.name ?? ''))
        .limit(1);

      if (finalIsMikrotik) {
        const resolvedRouterIp =
          routerIp?.trim() || existingMikrotik?.routerIp || DEFAULT_ROUTER_IP;
        const apiPortValue = updated.apiPort ?? null;

        if (existingMikrotik) {
          await tx
            .update(mikrotikVessels)
            .set({
              vesselName: updated.name ?? existingVessel.name ?? '',
              routerIp: resolvedRouterIp,
              apiPort: apiPortValue,
              updatedAt: new Date(),
            })
            .where(eq(mikrotikVessels.id, existingMikrotik.id));
        } else {
          await tx.insert(mikrotikVessels).values({
            vesselName: updated.name ?? existingVessel.name ?? '',
            routerIp: resolvedRouterIp,
            apiPort: apiPortValue,
          });
        }
      } else {
        const namesToClear = [existingVessel.name, updated.name].filter(
          (value): value is string => Boolean(value)
        );

        if (namesToClear.length > 0) {
          await tx
            .delete(mikrotikVessels)
            .where(inArray(mikrotikVessels.vesselName, namesToClear));
        }
      }

      return updated;
    });

    return {
      success: true,
      message: 'Vessel updated successfully',
      data: updatedVessel,
    };
  } catch (error) {
    console.error('Error in updateVessel_func:', error);
    return {
      success: false,
      message: 'Failed to update vessel',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
