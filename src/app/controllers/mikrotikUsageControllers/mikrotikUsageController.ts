import { Elysia } from "elysia";
import { getMikrotikUsage } from "./functions/getMikrotikUsage";
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
}
