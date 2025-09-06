import { Elysia, t } from "elysia";
import { PinManagementController } from "../../app/controllers/pinManagementControllers/pinManagementController";
import { checkUser } from "../../app/middlewares/permissions";
import { cookie } from "@elysiajs/cookie";

// Define permissions
const permission = {
  "POST_/api/pin-management/generate": "generate_pins",
  "GET_/api/pin-management/pins": "view_pins",
};

const pinManagementRoute = new Elysia({ prefix: "/api/pin-management" })
  .use(cookie())
  // Generate Pins
  // Get all pins
  .get("/pins", PinManagementController.getPins, {
    beforeHandle: [checkUser(permission["GET_/api/pin-management/pins"])],
    tags: ["Pin Management"],
    detail: {
      summary: "Get all pins",
      description:
        "Retrieves all pins with their associated vessel and generator information",
      operationId: "getAllPins",
    },
  })

  // Generate new pins
  .post("/generate", PinManagementController.generatePin, {
    beforeHandle: [checkUser(permission["POST_/api/pin-management/generate"])],
    body: t.Object({
      vessel_id: t.Number({
        description: "ID of the vessel",
        examples: [1, 2, 3],
      }),
      kitp: t.String({
        description: "KITP number",
        examples: ["KITP123456"],
      }),
      number_of_pins_to_generate: t.Number({
        description: "Number of pins to generate (1-50)",
        minimum: 1,
        maximum: 50,
        examples: [5],
      }),
    }),
    tags: ["Pin Management"],
    detail: {
      summary: "Generate pins for a vessel",
      description:
        "Generates random usernames and passwords, stores them in the database, and returns the generated credentials.",
      operationId: "generatePins",
    },
  });

export default pinManagementRoute;
