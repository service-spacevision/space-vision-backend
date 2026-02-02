import { generateRandomString } from '../../../../utils/stringHelpers';
import {
  createMikrotikConnection,
  MikrotikAPI,
} from '../../../utils/mikrotikAPI';
import { db } from '../../../db/connection';
import { pins, type NewPin } from '../../../models/Pin';
import { mikrotikPermissions } from '../../../models/MikrotikPermission';
import { eq, and, desc } from 'drizzle-orm';
import { PinType } from '../../../../types/pin.types';
import { mikrotikVessels } from '../../../models/MikrotikVessel';
import { vessels } from '../../../models/Vessel';

export interface GeneratePinParams {
  reqObject: {
    user: any;
  };
  data: {
    type: PinType;
    vessel_id?: number;
    vessel_name?: string;
    kitp?: string;
    mikrotik_user_name?: string;
    number_of_pins_to_generate: number;
    access_type?: 'crew' | 'system'; // New field for access type
    profile?: string; // Add this line
    server?: string; // Add this line
    limitBytesTotal?: number; // Add this line for data limit in bytes
  };
}

export async function generatePin_func({ reqObject, data }: GeneratePinParams) {
  try {
    const {
      type,
      vessel_id,
      vessel_name,
      kitp,
      mikrotik_user_name,
      number_of_pins_to_generate,
      access_type = 'crew', // Default to 'crew' for backward compatibility
      profile,
      server,
      limitBytesTotal,
    } = data;

    const generated_by = reqObject.user.id;
    const isSystemAdmin = reqObject.user.role.isSystem;
    const isAdmin = reqObject.user.role.name === 'admin';

    // Validate input
    if (number_of_pins_to_generate <= 0 || number_of_pins_to_generate > 50) {
      return {
        success: false,
        message: 'Number of pins to generate must be between 1 and 50',
      };
    }

    // Validate based on pin type
    if (type === PinType.OTHER) {
      console.log(data);
      if (!vessel_id || !kitp) {
        return {
          success: false,
          message: 'vessel_id and kitp are required for non-MikroTik pins',
        };
      }

      // Check if vessel exists
      if (typeof vessel_id === 'undefined') {
        return {
          success: false,
          message: 'vessel_id is required',
        };
      }

      const [vessel] = await db
        .select({ id: vessels.id })
        .from(vessels)
        .where(eq(vessels.id, vessel_id))
        .limit(1);

      if (!vessel) {
        return {
          success: false,
          message: 'Vessel not found',
        };
      }
    } else {
      // MikroTik pin validation
      if (!vessel_id || !vessel_name) {
        return {
          success: false,
          message: 'vessel_id and vessel_name are required for MikroTik pins',
        };
      }

      // Check if MikroTik vessel exists
      const [mikrotikVessel] = await db
        .select({ id: mikrotikVessels.id })
        .from(mikrotikVessels)
        .where(eq(mikrotikVessels.id, vessel_id))
        .limit(1);

      if (!mikrotikVessel) {
        return {
          success: false,
          message: 'Vessel not found',
        };
      }
    }

    // Generate pins
    const generatedPins: NewPin[] = [];
    const responsePins: Array<{
      username: string;
      password: string;
      type: string;
      access_type: 'crew' | 'system';
      vessel_id?: number;
      vessel_name?: string;
      kitp?: string;
      mikrotik_user_name?: string;
      router_ip?: string;
      router_port?: number;
      organization_id?: number;
      assigned_by?: number;
      profile?: string;
      server?: string;
      limit_bytes_total?: number;
    }> = [];

    // Get organization ID from user
    const userOrgId = reqObject.user.organizationId;
    console.log(reqObject.user);
    if (!userOrgId && !isSystemAdmin) {
      return {
        success: false,
        message: 'User organization not found',
      };
    }

    // if (!isSystemAdmin || !isAdmin) {
    //   return {
    //     success: false,
    //     message: 'User is not authorized to generate pins',
    //   };
    // }

    for (let i = 0; i < number_of_pins_to_generate; i++) {
      // For system type, generate 6-character alphanumeric username/password
      // For MikroTik pins with crew access type
      const isSystem = access_type === 'system';
      const username = isSystem
        ? generateRandomString(6, true) // 6 alphanumeric for system
        : generateRandomString(4, false); // 4 letters for crew

      const password = isSystem
        ? generateRandomString(6, true) // 6 alphanumeric for system
        : generateRandomString(4, true); // 4 numbers for crew

      // Encode to base64 for storage
      const encodedUsername = Buffer.from(username).toString('base64');
      const encodedPassword = Buffer.from(password).toString('base64');

      // Create the pin data object with proper type handling
      const pinData: NewPin = {
        type: type === PinType.OTHER ? 'other' : 'mikrotik',
        username: encodedUsername,
        password: encodedPassword,
        generated_by: generated_by,
        ...(type === PinType.OTHER
          ? {
              kitp: kitp!,
              vessel_id: vessel_id, // Include vessel_id for non-MikroTik pins
              vessel_name: vessel_name,
            }
          : {
              kitp: undefined,
              vessel_id: vessel_id,
              vessel_name: vessel_name,
            }),
      };

      // Add to database batch
      generatedPins.push(pinData);

      // Add to response with decoded values
      responsePins.push({
        username,
        password,
        access_type,
        type: type === PinType.OTHER ? 'other' : 'mikrotik',
        ...(type === PinType.OTHER
          ? {
              vessel_id,
              kitp,
              vessel_name,
            }
          : {
              vessel_id,
              vessel_name,
            }),
        mikrotik_user_name,
        profile,
        server,
        limit_bytes_total: limitBytesTotal,
        assigned_by: generated_by,
      });
    }
    if (generatedPins.length > 0) {
      try {
        await db.transaction(async (tx) => {
          let insertedPins;

          if (type === PinType.MIKROTIK && vessel_id) {
            if (access_type === 'system') {
              // For system type, insert directly and create permissions without MikroTik integration
              insertedPins = await tx
                .insert(pins)
                .values(generatedPins)
                .returning();

              // Create permissions for system type
              const permissions = generatedPins.map((pin) => ({
                vesselId: vessel_id,
                vesselName: vessel_name || 'Unknown Vessel',
                mikrotikUserName: mikrotik_user_name || 'None',
                routerIp: '0.0.0.0',
                routerPort: 0,
                organizationId: userOrgId,
                username: Buffer.from(pin.username, 'base64').toString(),
                password: Buffer.from(pin.password, 'base64').toString(),
                type: 'system',
                assignedById: generated_by,
              }));

              if (permissions.length > 0) {
                await tx.insert(mikrotikPermissions).values(permissions);
              }
            } else {
              // For crew type, we'll handle the insertion in the MikroTik section
              insertedPins = [];
            }
          } else {
            // For non-MikroTik pins, insert them here
            insertedPins = await tx
              .insert(pins)
              .values(generatedPins)
              .returning();

            console.log(`Inserted ${insertedPins.length} pins`);

            // If these are non-MikroTik pins, create permissions
            if (type === PinType.OTHER) {
              const permissions = insertedPins.map((pin) => ({
                vesselId: vessel_id!,
                vesselName: vessel_name || 'Unknown Vessel',
                mikrotikUserName: 'None',
                routerIp: '0.0.0.0',
                routerPort: 0,
                type: access_type,
                organizationId: userOrgId,
                username: Buffer.from(pin.username, 'base64').toString(),
                password: Buffer.from(pin.password, 'base64').toString(),

                assignedById: generated_by,
              }));

              if (permissions.length > 0) {
                console.log(
                  `Creating ${permissions.length} permission entries`
                );
                await tx.insert(mikrotikPermissions).values(permissions);
              }
            }
          }

          if (
            type === PinType.MIKROTIK &&
            vessel_id &&
            access_type === 'crew'
          ) {
            // Insert MikroTik pins
            const insertedMikrotikPins = await tx
              .insert(pins)
              .values(generatedPins)
              .returning();

            console.log(
              `Inserted ${insertedMikrotikPins.length} MikroTik pins`
            );
            insertedPins = insertedMikrotikPins;

            // Fetch the Mikrotik vessel details
            const [mikrotikVessel] = await tx
              .select({
                routerIp: mikrotikVessels.routerIp,
                apiPort: mikrotikVessels.apiPort,
              })
              .from(mikrotikVessels)
              .where(eq(mikrotikVessels.id, vessel_id))
              .limit(1);

            if (!mikrotikVessel) {
              throw new Error('Mikrotik vessel not found');
            }

            // Create MikroTik connection and push users to router
            let mikrotikSuccess = true;
            let createdUsers: Array<{ username: string; password: string }> =
              [];

            try {
              if (mikrotikVessel.routerIp && mikrotikVessel.apiPort) {
                console.log(
                  `🔌 Connecting to MikroTik router at ${mikrotikVessel.routerIp}:${mikrotikVessel.apiPort}`
                );

                // Import here to avoid issues if router is not available
                const { createMikrotikConnection } = await import(
                  '../../../utils/mikrotikAPI'
                );
                const mikrotikAPI = await createMikrotikConnection(
                  mikrotikVessel.routerIp,
                  mikrotikVessel.apiPort,
                  false,
                  'api'
                );

                if (await mikrotikAPI.connect()) {
                  // Ensure hotspot servers exist
                  const servers = await mikrotikAPI.getHotspotServers();
                  const defaultServer =
                    servers.length > 0 ? servers[0].name : 'hotspot1';

                  // Ensure user profile exists
                  const profile = 'General';
                  await mikrotikAPI.createHotspotUserProfile(profile);

                  // Push each user to MikroTik
                  for (const pin of generatedPins) {
                    const username = Buffer.from(
                      pin.username,
                      'base64'
                    ).toString();
                    const password = Buffer.from(
                      pin.password,
                      'base64'
                    ).toString();
                    console.log(
                      'payload',
                      username,
                      password,
                      data.profile,
                      data.server,
                      data.limitBytesTotal
                    );

                    const success = await mikrotikAPI.createHotspotUser({
                      name: username,
                      password: password,
                      profile: data.profile || 'General',
                      server: data.server || defaultServer,
                      dataLimitBytes: data.limitBytesTotal || undefined, // No data limit for now
                    });

                    if (success) {
                      createdUsers.push({ username, password });
                      console.log(
                        `✅ Pushed user ${username} to MikroTik router`
                      );
                    } else {
                      console.error(
                        `❌ Failed to push user ${username} to MikroTik router`
                      );
                    }
                  }

                  await mikrotikAPI.disconnect();
                  console.log(
                    `✅ Successfully pushed ${createdUsers.length}/${generatedPins.length} users to MikroTik router`
                  );
                } else {
                  // Try to get more detailed connection information
                  const connectionTest = await mikrotikAPI.testConnection();
                  console.warn(
                    `⚠️ Could not connect to MikroTik router at ${mikrotikVessel.routerIp}:${mikrotikVessel.apiPort}`
                  );
                  console.warn(`📊 Connection test results:`, connectionTest);
                  mikrotikSuccess = false;
                }
              } else {
                console.warn(
                  `⚠️ MikroTik vessel ${vessel_id} missing router configuration`
                );
                mikrotikSuccess = false;
              }
            } catch (error) {
              console.error(
                `❌ Error pushing users to MikroTik router:`,
                error
              );
              mikrotikSuccess = false;
            }

            const permissions = generatedPins.map((pin) => ({
              vesselId: vessel_id,
              vesselName: vessel_name || 'Unknown Vessel',
              mikrotikUserName: mikrotik_user_name || 'None',
              routerIp: mikrotikVessel.routerIp || '0.0.0.0',
              routerPort: mikrotikVessel.apiPort || 0,
              organizationId: userOrgId,
              username: Buffer.from(pin.username, 'base64').toString(),
              password: Buffer.from(pin.password, 'base64').toString(),
              type: access_type, // Set the type based on access_type
              assignedById: generated_by,
              profile: data.profile || 'General',
              server: data.server || 'hotspot1',
              limitBytesTotal: data.limitBytesTotal
                ? data.limitBytesTotal.toString()
                : null,
            }));

            if (permissions.length > 0) {
              await tx.insert(mikrotikPermissions).values(permissions);
            }

            // Update response message to include MikroTik status
            if (mikrotikSuccess) {
              console.log(
                `✅ MikroTik integration successful: ${createdUsers.length} users pushed to router`
              );
            } else {
              console.warn(
                `⚠️ Database storage successful but MikroTik integration failed`
              );
            }
          }
        });

        console.log(`Successfully inserted ${generatedPins.length} pins`);
      } catch (error) {
        console.error('Transaction failed:', error);
        return {
          success: false,
          message: 'Failed to generate pins',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return {
      success: true,
      message: `${number_of_pins_to_generate} pins generated successfully`,
      data: responsePins,
    };
  } catch (error) {
    console.error('Error generating pins:', error);
    return {
      success: false,
      message: 'Failed to generate pins',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
