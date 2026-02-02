import { db } from '../../../db/connection';
import { vessels, mikrotikVessels } from '../../../db/schema';
import { eq, inArray } from 'drizzle-orm';

interface DeleteVesselParams {
  reqObject: {
    user: any;
  };
  query: {
    id: string;
  };
}

export async function deleteVessel_func({
  reqObject,
  query,
}: DeleteVesselParams) {
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

    await db.transaction(async (tx) => {
      await tx.delete(vessels).where(eq(vessels.id, vesselId));

      if (existingVessel.isMikrotik) {
        const namesToDelete = [existingVessel.name].filter(
          (value): value is string => Boolean(value)
        );

        if (namesToDelete.length > 0) {
          await tx
            .delete(mikrotikVessels)
            .where(inArray(mikrotikVessels.vesselName, namesToDelete));
        }
      }
    });

    return {
      success: true,
      message: 'Vessel deleted successfully',
      data: existingVessel,
    };
  } catch (error) {
    console.error('Error in deleteVessel_func:', error);
    return {
      success: false,
      message: 'Failed to delete vessel',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
