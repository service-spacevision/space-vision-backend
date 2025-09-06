import { generateRandomString } from "../../../../utils/stringHelpers";
import { db } from "../../../db/connection";
import { pins } from "../../../models/Pin";

import { eq } from "drizzle-orm";

export interface GeneratePinParams {
  reqObject: {
    user: any;
  };
  data: {
    vessel_id: number;
    kitp: string;
    number_of_pins_to_generate: number;
  };
}

export async function generatePin_func({ reqObject, data }: GeneratePinParams) {
  try {
    const { vessel_id, kitp, number_of_pins_to_generate } = data;
    const generated_by = reqObject.user.id;

    // Validate input
    if (number_of_pins_to_generate <= 0 || number_of_pins_to_generate > 50) {
      return {
        success: false,
        message: "Number of pins to generate must be between 1 and 50",
      };
    }

    // Check if vessel exists - we need to import the vessels table
    const { vessels } = await import("../../../models/Vessel");
    const [vessel] = await db
      .select({ id: vessels.id })
      .from(vessels)
      .where(eq(vessels.id, vessel_id))
      .limit(1);

    if (!vessel) {
      return {
        success: false,
        message: "Vessel not found",
      };
    }

    // Generate pins
    const generatedPins: Array<{
      vessel_id: number;
      kitp: string;
      username: string;
      password: string;
      generated_by: number;
    }> = [];

    const responsePins: Array<{
      username: string;
      password: string;
      kitp: string;
      vessel_id: number;
    }> = [];

    for (let i = 0; i < number_of_pins_to_generate; i++) {
      const username = generateRandomString(8, true, true, true);
      const password = generateRandomString(12, true, true, true);

      // Encode to base64
      const encodedUsername = Buffer.from(username).toString("base64");
      const encodedPassword = Buffer.from(password).toString("base64");

      generatedPins.push({
        vessel_id,
        kitp,
        username: encodedUsername,
        password: encodedPassword,
        generated_by,
      });

      responsePins.push({
        username,
        password,
        kitp,
        vessel_id,
      });
    }

    // Insert all pins in a transaction
    await db.transaction(async (tx) => {
      await tx.insert(pins).values(generatedPins);
    });

    return {
      success: true,
      message: `${number_of_pins_to_generate} pins generated successfully`,
      data: responsePins,
    };
  } catch (error) {
    console.error("Error generating pins:", error);
    return {
      success: false,
      message: "Failed to generate pins",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
