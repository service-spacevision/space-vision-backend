import { db } from "../../../db/connection";
import { pins } from "../../../models/Pin";
import { users } from "../../../models/User";
import { vessels } from "../../../models/Vessel";
import { eq } from "drizzle-orm";

export async function getPins_func() {
  try {
    const allPins = await db
      .select({
        id: pins.id,
        username: pins.username,
        password: pins.password,
        kitp: pins.kitp,
        vessel_id: pins.vessel_id,
        vessel_name: vessels.name,
        generated_by: users.email, // Using email instead of name
        created_at: pins.created_at,
      })
      .from(pins)
      .leftJoin(vessels, eq(pins.vessel_id, vessels.id))
      .leftJoin(users, eq(pins.generated_by, users.id))
      .orderBy(pins.created_at);

    // Decode the usernames and passwords
    const decodedPins = allPins.map((pin) => ({
      ...pin,
      username: Buffer.from(pin.username, "base64").toString("utf-8"),
      password: Buffer.from(pin.password, "base64").toString("utf-8"),
    }));

    return {
      success: true,
      message: "Pins retrieved successfully",
      data: decodedPins,
    };
  } catch (error) {
    console.error("Error fetching pins:", error);
    return {
      success: false,
      message: "Failed to fetch pins",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
