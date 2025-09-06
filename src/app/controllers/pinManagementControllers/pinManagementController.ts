import { generatePin_func } from "./functions/createPin";
import { getPins_func } from "./functions/getPin";
import { CustomContext } from "../../utils/types";

export class PinManagementController {
  static async generatePin(ctx: CustomContext) {
    try {
      const { body } = ctx as {
        body: {
          vessel_id: number;
          kitp: string;
          number_of_pins_to_generate: number;
        };
      };
      const { user } = ctx;

      if (!user) {
        ctx.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      // Validate required fields
      if (!body.vessel_id || !body.kitp || !body.number_of_pins_to_generate) {
        ctx.set.status = 400;
        return {
          success: false,
          message:
            "Missing required fields: vessel_id, kitp, and number_of_pins_to_generate are required",
        };
      }

      const result = await generatePin_func({
        reqObject: { user },
        data: {
          vessel_id: body.vessel_id,
          kitp: body.kitp,
          number_of_pins_to_generate: body.number_of_pins_to_generate,
        },
      });

      ctx.set.status = result.success ? 201 : 400;
      return result;
    } catch (error) {
      console.error("Error in generatePin controller:", error);
      ctx.set.status = 500;
      return {
        success: false,
        message: "Internal server error while generating pins",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async getPins(ctx: CustomContext) {
    try {
      const result = await getPins_func();
      ctx.set.status = result.success ? 200 : 400;
      return result;
    } catch (error) {
      console.error("Error in getPins controller:", error);
      ctx.set.status = 500;
      return {
        success: false,
        message: "Internal server error while fetching pins",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
