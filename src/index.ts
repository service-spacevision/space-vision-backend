import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cookie } from "@elysiajs/cookie";
import { APP_CONFIG } from "./app/constants/constants";
import { connectDatabase } from "./app/db/connection";
import { initializeSystem } from "./app/db/initializeSystem";
import { smartMigrate } from "./app/db/syncMigrations";
import { initializeMaterializedViews } from "./app/db/initializeMaterializedViews";
import { corsMiddleware } from "./app/middlewares/cors";
// import { loggingMiddleware } from './app/middlewares/logging'
import {
  authRoutes,
  userRoutes,
  userRoleRoutes,
  systemRoutes,
  vesselRoutes,
  vesselGroupRoutes,
  groupAccessRoutes,
  starlinkUsageRoutes,
  bluetideUsageRoutes,
  mikrotikVesselRoutes,
  telephonyDidRoutes,
  pinManagementRoutes,
} from "./routes/indexRoute";

const app = new Elysia()
  .use(cookie())
  .use(
    swagger({
      documentation: {
        info: {
          title: APP_CONFIG.NAME,
          version: APP_CONFIG.VERSION,
          description: APP_CONFIG.DESCRIPTION,
        },
        tags: [
          { name: "Authentication", description: "Authentication endpoints" },
          { name: "User", description: "User management endpoints" },
          { name: "UserRole", description: "User role management endpoints" },
          { name: "System", description: "System health and status endpoints" },
          { name: "Vessels", description: "Vessel management endpoints" },
          {
            name: "Vessel Groups",
            description: "Vessel group management endpoints",
          },
          {
            name: "Group Access",
            description: "Group access management endpoints",
          },
          {
            name: "Starlink Usage",
            description: "Starlink usage tracking endpoints",
          },
          {
            name: "Bluetide Usage",
            description: "Bluetide usage tracking endpoints",
          },
          {
            name: "Bluetide Telemetry",
            description: "Bluetide telemetry data endpoints",
          },
          {
            name: "Mikrotik Vessels",
            description: "Mikrotik vessel management endpoints",
          },
          {
            name: "Telephony DIDs",
            description: "Telephony DID management endpoints",
          },
        ],
        servers: [
          {
            url:
              process.env.NODE_ENV === "production"
                ? "https://your-domain.com"
                : `http://103.147.107.239:${APP_CONFIG.PORT}`,
            description:
              process.env.NODE_ENV === "production"
                ? "Production server"
                : "Development server",
          },
          {
            url: "http://localhost:3000",
            description: "Local development server",
          }
        ],
      },
    })
  )
  .use(corsMiddleware)
  // .use(loggingMiddleware)
  .get("/", () => ({
    success: true,
    message: `Welcome to ${APP_CONFIG.NAME}`,
    version: APP_CONFIG.VERSION,
    documentation: "/swagger",
    endpoints: {
      health: "/api/system/health",
      status: "/api/system/status",
      auth: "/api/auth",
      users: "/api/users",
      userRoles: "/api/user-roles",
      vessels: "/api/vessels",
      vesselGroups: "/api/vessel-groups",
      groupAccess: "/api/group-access",
      starlinkUsage: "/api/starlink-usage",
      bluetideUsage: "/api/bluetide-usage",
      bluetideTelemetry: "/api/bluetide-telemetry",
      mikrotikVessels: "/api/mikrotik-vessels",
      telephonyDids: "/api/telephony-dids",
    },
  }))
  .use(authRoutes)
  .use(userRoutes)
  .use(userRoleRoutes)
  .use(systemRoutes)
  .use(vesselRoutes)
  .use(vesselGroupRoutes)
  .use(groupAccessRoutes)
  .use(starlinkUsageRoutes)
  .use(bluetideUsageRoutes)
  .use(mikrotikVesselRoutes)
  .use(telephonyDidRoutes)
  .use(pinManagementRoutes)
  .onError(({ error, code, set }) => {
    console.error("Application error:", error);

    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        success: false,
        error: "Route not found",
        status: 404,
      };
    }

    if (code === "VALIDATION") {
      set.status = 400;
      return {
        success: false,
        error: "Validation error",
        message: error.message,
        status: 400,
      };
    }

    set.status = 500;
    return {
      success: false,
      error: "Internal server error",
      status: 500,
    };
  })
  .listen(APP_CONFIG.PORT);

// Initialize database connection and system setup
async function startServer() {
  try {
    await connectDatabase();

    // Use smart migration system
    await smartMigrate();

    // Initialize system (seed roles and admin)
    await initializeSystem();

    // Initialize materialized views for analytics
    await initializeMaterializedViews();

    console.log("✅ Server initialization completed successfully");
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
}

startServer();

console.log(
  `🦊 ${APP_CONFIG.NAME} is running at http://${app.server?.hostname}:${app.server?.port}`
);
console.log(
  `📚 API Documentation available at http://${app.server?.hostname}:${app.server?.port}/swagger`
);
console.log(
  `🏥 Health check available at http://${app.server?.hostname}:${app.server?.port}/api/system/health`
);
