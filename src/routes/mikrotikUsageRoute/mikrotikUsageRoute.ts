import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { MikrotikUsageController } from "../../app/controllers/mikrotikUsageControllers/mikrotikUsageController";
import { checkUser } from "../../app/middlewares/permissions";

const permission = {
  "GET_/api/mikrotik-usage": "read_mikrotik_usage",
  "GET_/api/mikrotik-usage/vessel": "read_mikrotik_usage",
  "POST_/api/mikrotik-usage/sync": "sync_mikrotik_usage",
  "POST_/api/mikrotik-usage/crew-login": "crew_login",
};

const mikrotikUsageRoute = new Elysia({ prefix: "/api/mikrotik-usage" })
  .use(cookie())

  // Get usage data for all vessels
  .get("/", MikrotikUsageController.getMikrotikUsage, {
    beforeHandle: [checkUser(permission["GET_/api/mikrotik-usage"])],
    query: t.Object({
      vesselName: t.Optional(
        t.String({
          description: "Filter by vessel name",
        })
      ),
      username: t.Optional(
        t.String({
          description: "Filter by username",
        })
      ),
      currentPage: t.Optional(
        t.String({
          description: "Current page number",
          default: "1",
        })
      ),
      pageSize: t.Optional(
        t.String({
          description: "Number of items per page",
          default: "10",
        })
      ),
    }),
    detail: {
      tags: ["Mikrotik Usage"],
      description: "Get All Mikrotik usage data",
      summary: "Get All Mikrotik usage data",
      security: [{ bearerAuth: [] }],
    },
  })

  // Get usage data for a specific vessel
  .get("/vessel", MikrotikUsageController.getMikrotikUsageByVesselId, {
    beforeHandle: [checkUser(permission["GET_/api/mikrotik-usage/vessel"])],
    query: t.Object({
      vesselId: t.String({
        description: "ID of the vessel",
      }),
      mode: t.Union([t.Literal("current-session"), t.Literal("all-time")], {
        description: "Type of usage data to retrieve",
        default: "current-session",
      }),
      currentPage: t.Optional(
        t.String({
          description: "Current page number",
          default: "1",
        })
      ),
      pageSize: t.Optional(
        t.String({
          description: "Number of items per page",
          default: "10",
        })
      ),
      username: t.Optional(
        t.String({
          description: "Filter by username",
        })
      ),
    }),
    detail: {
      tags: ["Mikrotik Usage"],
      summary: "Get Mikrotik usage data for a specific vessel",
      description:
        "Get Mikrotik usage data for a specific vessel with pagination and filtering",
      security: [{ bearerAuth: [] }],
    },
  })

  // Trigger sync with Mikrotik routers
  .post("/sync", MikrotikUsageController.syncMikrotikUsage, {
    beforeHandle: [checkUser(permission["POST_/api/mikrotik-usage/sync"])],
    detail: {
      tags: ["Mikrotik Usage"],
      summary: "Sync Mikrotik routers to update usage data",
      description:
        "Trigger a sync with all Mikrotik routers to update usage data",
      security: [{ bearerAuth: [] }],
    },
  })
  
  // Crew login endpoint
  .post("/crew-login", MikrotikUsageController.crewLogin, {
    body: t.Object({
      username: t.String({
        description: "Crew username",
        minLength: 1,
      }),
      password: t.String({
        description: "Crew password",
        minLength: 1,
      }),
    }),
    detail: {
      tags: ["Mikrotik Usage"],
      summary: "Crew login to access vessel usage data",
      description: "Authenticate crew and return vessel usage data",
    },
  });

export { permission };
export default mikrotikUsageRoute;
