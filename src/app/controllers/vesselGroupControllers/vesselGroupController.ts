import { CustomContext } from "../../utils/types";
import { getVesselGroups_func } from "./functions/getVesselGroups";
import { createVesselGroup_func } from "./functions/createVesselGroup";
import { updateVesselGroup_func } from "./functions/updateVesselGroup";
import { deleteVesselGroup_func } from "./functions/deleteVesselGroup";

export class VesselGroupController {
  static async getVesselGroups(ctx: CustomContext) {
    try {
      const { query } = ctx;
      const user = ctx.user!;
      console.log("user", user);

      const pagination = {
        currentPage: Number(query?.currentPage) || 1,
        pageSize: Number(query?.pageSize) || 10,
        all: query?.all || "false",
      };

      const result = await getVesselGroups_func({
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
        message: "Internal server error while fetching vessel groups",
      };
    }
  }

  static async createVesselGroup(ctx: CustomContext) {
    try {
      const { body } = ctx;
      const user = ctx.user!;

      const result = await createVesselGroup_func({
        reqObject: { user },
        data: body as any,
      });

      ctx.set.status = result?.success === true ? 201 : 400;
      return result;
    } catch (err: any) {
      ctx.set.status = 500;
      return {
        success: false,
        message: "Internal server error while creating vessel group",
      };
    }
  }

  static async updateVesselGroup(ctx: CustomContext) {
    try {
      const { body, query } = ctx;
      const user = ctx.user!;

      const result = await updateVesselGroup_func({
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
        message: "Internal server error while updating vessel group",
      };
    }
  }

  static async deleteVesselGroup(ctx: CustomContext) {
    try {
      const { query } = ctx;
      const user = ctx.user!;

      const result = await deleteVesselGroup_func({
        reqObject: { user },
        query: query as any,
      });

      ctx.set.status = result?.success === true ? 200 : 400;
      return result;
    } catch (err: any) {
      ctx.set.status = 500;
      return {
        success: false,
        message: "Internal server error while deleting vessel group",
      };
    }
  }
}
