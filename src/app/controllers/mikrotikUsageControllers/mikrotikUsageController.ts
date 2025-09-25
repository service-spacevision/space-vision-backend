import { Elysia } from "elysia";
import { getMikrotikUsage } from "./functions/getMikrotikUsage";
import { getMikrotikUsageByVesselId } from "./functions/getMikrotikUsageByVesselId";
import { syncMikrotikUsage } from "./functions/syncMikrotikUsage";

export class MikrotikUsageController {
  static getMikrotikUsage = async ({
    query,
    set,
  }: {
    query: any;
    set: any;
  }) => {
    try {
      const { vesselName, username, currentPage, pageSize } = query as {
        vesselName?: string;
        username?: string;
        currentPage?: string;
        pageSize?: string;
      };

      const { data, pagination } = await getMikrotikUsage({
        vesselName,
        username,
        currentPage,
        pageSize,
      });

      return {
        success: true,
        data,
        pagination,
      };
    } catch (error) {
      console.error("Error fetching Mikrotik usage:", error);
      set.status = 500;
      return {
        success: false,
        message: "Failed to fetch Mikrotik usage data",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  static syncMikrotikUsage = async ({ set }: { set: any }) => {
    try {
      const result = await syncMikrotikUsage();
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error("Error starting Mikrotik sync:", error);
      set.status = 500;
      return {
        success: false,
        message: "Failed to start Mikrotik sync",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  static getMikrotikUsageByVesselId = async ({
    query,
    set,
  }: {
    query: {
      vesselId: string;
      mode: 'current-session' | 'all-time';
      currentPage?: string;
      pageSize?: string;
      username?: string;
    };
    set: any;
  }) => {
    try {
      const { vesselId, mode, username, currentPage, pageSize } = query;

      const result = await getMikrotikUsageByVesselId({
        vesselId: parseInt(vesselId, 10),
        mode,
        username,
        currentPage,
        pageSize,
      });

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error(`Error fetching Mikrotik usage for vessel:`, error);
      set.status = 500;
      return {
        success: false,
        message: 'Failed to fetch Mikrotik usage data for the specified vessel',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };
}
