import { generatePin_func } from './functions/createPin';
import { getPins_func } from './functions/getPin';
import {
  listMikrotikUsers_func,
  testMikrotikConnection_func,
} from './functions/listMikrotikUsers';

import { PinType } from '../../../types/pin.types';
import { CustomContext } from '../../utils/types';
import { syncMikrotikUsers_func } from './functions/syncMikrotikUsers';

export class PinManagementController {
  static async generatePin(ctx: CustomContext) {
    try {
      const { body } = ctx as {
        body: {
          type?: PinType;
          kitp?: string;
          mikrotik_user_name?: string;
          vessel_id?: number;
          vessel_name?: string;
          number_of_pins_to_generate: number;
          access_type?: 'crew' | 'system'; // New parameter
        };
      };
      const { user } = ctx;

      if (!user) {
        ctx.set.status = 401;
        return {
          success: false,
          message: 'Unauthorized',
        };
      }

      // Validate required fields based on type
      if (body.type === PinType.OTHER) {
        if (!body.kitp) {
          ctx.set.status = 400;
          return {
            success: false,
            message: 'kitp is required for non-MikroTik pins',
          };
        }
      } else {
        if (!body.vessel_id || !body.vessel_name) {
          ctx.set.status = 400;
          return {
            success: false,
            message: 'vessel_id and vessel_name are required for MikroTik pins',
          };
        }
      }

      if (!body.number_of_pins_to_generate) {
        ctx.set.status = 400;
        return {
          success: false,
          message: 'number_of_pins_to_generate is required',
        };
      }

      // Ensure type is defined (default to 'mikrotik' if not provided)
      const pinType: PinType = body.type || PinType.MIKROTIK;

      const result = await generatePin_func({
        reqObject: { user },
        data: {
          type: pinType,
          kitp: body.kitp,
          mikrotik_user_name: body.mikrotik_user_name || '',
          vessel_id: body.vessel_id,
          vessel_name: body.vessel_name,
          number_of_pins_to_generate: body.number_of_pins_to_generate,
          access_type: body.access_type || 'crew', // Default to 'crew' for backward compatibility
        },
      });

      ctx.set.status = result.success ? 201 : 400;
      return result;
    } catch (error) {
      console.error('Error in generatePin controller:', error);
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async getPins(ctx: CustomContext) {
    try {
      const query = ctx.query as unknown as {
        page?: string;
        pageSize?: string;
        type?: string;
        vessel_id?: string;
        username?: string;
        vessel_name?: string;
      };

      // Convert query params to proper types
      const type = query.type as PinType | undefined;
      const page = query.page ? parseInt(query.page, 10) : 1;
      const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 10;
      const vessel_id = query.vessel_id
        ? parseInt(query.vessel_id, 10)
        : undefined;
      const username = query.username;
      const vessel_name = query.vessel_name;

      return await getPins_func({
        page,
        pageSize,
        type,
        vessel_id,
        username,
        vessel_name,
      });
    } catch (error) {
      console.error('Error in getPins controller:', error);
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Failed to retrieve pins',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async listMikrotikUsers(ctx: CustomContext) {
    try {
      const query = ctx.query as unknown as {
        vessel_id: string;
        server_name?: string;
        profile?: string;
        limit?: string;
      };

      if (!query.vessel_id) {
        ctx.set.status = 400;
        return {
          success: false,
          message: 'vessel_id is required',
        };
      }

      const result = await listMikrotikUsers_func({
        vessel_id: parseInt(query.vessel_id, 10),
        server_name: query.server_name,
        profile: query.profile,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
      });

      ctx.set.status = result.success ? 200 : 400;
      return result;
    } catch (error) {
      console.error('Error in listMikrotikUsers controller:', error);
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync MikroTik users from all vessels and store them in the database
   */
  static async syncMikrotikUsers(ctx: CustomContext) {
    try {
      const { user } = ctx;

      if (!user) {
        ctx.set.status = 401;
        return {
          success: false,
          message: 'Unauthorized',
        };
      }

      console.log(
        `🔄 Starting MikroTik users sync initiated by user ${user.id}`
      );

      // Call the sync function
      const result = await syncMikrotikUsers_func();

      ctx.set.status = result.success ? 200 : 400;
      return result;
    } catch (error) {
      console.error('Error in syncMikrotikUsers controller:', error);
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Failed to sync MikroTik users',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async testMikrotikConnection(ctx: CustomContext) {
    try {
      const query = ctx.query as unknown as {
        vessel_id: string;
      };
      const { user } = ctx;

      if (!user) {
        ctx.set.status = 401;
        return {
          success: false,
          message: 'Unauthorized',
        };
      }

      const vessel_id = parseInt(query.vessel_id, 10);
      if (!vessel_id) {
        ctx.set.status = 400;
        return {
          success: false,
          message: 'vessel_id is required',
        };
      }

      const result = await testMikrotikConnection_func({
        vessel_id,
      });

      ctx.set.status = result.success ? 200 : 400;
      return result;
    } catch (error) {
      console.error('Error in testMikrotikConnection controller:', error);
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
