import { CustomContext } from "../../utils/types";
import { getBluetideUsage_func } from "./functions/getBluetideUsage";
import { createBluetideUsage_func } from "./functions/createBluetideUsage";
import { updateBluetideUsage_func } from "./functions/updateBluetideUsage";
import { deleteBluetideUsage_func } from "./functions/deleteBluetideUsage";
import { syncBluetideTelemetry_func } from "./functions/syncBlutideTelemetry";

export class BluetideUsageController {
  static async getBluetideUsage(ctx: CustomContext) {
    try {
      const { query } = ctx;
      const user = ctx.user!;

      const pagination = {
        currentPage: Number(query?.currentPage) || 1,
        pageSize: Number(query?.pageSize) || 10,
        all: query?.all || "false",
      };

      const result = await getBluetideUsage_func({
        reqObject: { user },
        query: query as any,
        pagination,
      });

      ctx.set.status = result?.success === true ? 200 : 404;
      return result;
    } catch (err: any) {
      ctx.set.status = 500;
      return {
        success: false,
        message: "Internal server error while fetching bluetide usage",
      };
    }
  }

  static async createBluetideUsage(ctx: CustomContext) {
    try {
      const { body } = ctx;
      const user = ctx.user!;

      const result = await createBluetideUsage_func({
        reqObject: { user },
        data: body as any,
      });

      ctx.set.status = result?.success === true ? 201 : 400;
      return result;
    } catch (err: any) {
      ctx.set.status = 500;
      return {
        success: false,
        message: "Internal server error while creating bluetide usage",
      };
    }
  }

  static async updateBluetideUsage(ctx: CustomContext) {
    try {
      const { body, query } = ctx;
      const user = ctx.user!;

      const result = await updateBluetideUsage_func({
        reqObject: { user },
        query: query as any,
        data: body as any,
      });

      ctx.set.status = result?.success === true ? 200 : 400;
      return result;
    } catch (err: any) {
      ctx.set.status = 500;
      return {
        success: false,
        message: "Internal server error while updating bluetide usage",
      };
    }
  }

  static async deleteBluetideUsage(ctx: CustomContext) {
    try {
      const { query } = ctx;
      const user = ctx.user!;

      const result = await deleteBluetideUsage_func({
        reqObject: { user },
        query: query as any,
      });

      ctx.set.status = result?.success === true ? 200 : 400;
      return result;
    } catch (err: any) {
      ctx.set.status = 500;
      return {
        success: false,
        message: "Internal server error while deleting bluetide usage",
      };
    }
  }
  static async syncBluetideTelemetry(ctx: CustomContext) {
    try {
      const { query } = ctx;
      const user = ctx.user!;

      const result = await syncBluetideTelemetry_func({
        reqObject: { user },
      });

      ctx.set.status = result?.success === true ? 200 : 400;
      return result;
    } catch (err: any) {
      ctx.set.status = 500;
      return {
        success: false,
        message: "Internal server error while syncing starlink usage",
      };
    }
  }
}
