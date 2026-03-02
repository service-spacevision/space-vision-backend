import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cookie } from '@elysiajs/cookie';
import { APP_CONFIG } from './app/constants/constants';
import { connectDatabase, db } from './app/db/connection';
import { initializeSystem } from './app/db/initializeSystem';
import { smartMigrate } from './app/db/syncMigrations';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { initializeMaterializedViews } from './app/db/initializeMaterializedViews';
import { corsMiddleware } from './app/middlewares/cors';
import { startCrons } from './app/cron/index.cron';
import { ensureSyncState } from './app/db/ensureSyncState';
import { ensureBluetideTelemetry } from './app/db/ensureBluetideTelemetry';
import { ensurePermissions } from './app/db/ensurePermissions';
import { syncApiPermissions } from './app/controllers/permissionControllers/functions/syncApiPermissions';
import { populatePermissions } from './app/controllers/permissionControllers/functions/populatePermissions';
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
  mikrotikUsageRoutes,
  telephonyDidRoutes,
  pinManagementRoutes,
  permissionRoutes,
  rolesPermissionRoutes,
  organizationRoutes,
  hrEmployeeProfileRoutes,
  hrTimeClockRoutes,
  hrPolicyConfigRoutes,
  crewVoucherRoutes,
} from './routes/indexRoute';

const app: any = new Elysia()
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
          { name: 'Authentication', description: 'Authentication endpoints' },
          { name: 'User', description: 'User management endpoints' },
          { name: 'UserRole', description: 'User role management endpoints' },
          { name: 'System', description: 'System health and status endpoints' },
          { name: 'Vessels', description: 'Vessel management endpoints' },
          {
            name: 'Vessel Groups',
            description: 'Vessel group management endpoints',
          },
          {
            name: 'Group Access',
            description: 'Group access management endpoints',
          },
          {
            name: 'Starlink Usage',
            description: 'Starlink usage tracking endpoints',
          },
          {
            name: 'Bluetide Usage',
            description: 'Bluetide usage tracking endpoints',
          },
          {
            name: 'Bluetide Telemetry',
            description: 'Bluetide telemetry data endpoints',
          },
          {
            name: 'Mikrotik Vessels',
            description: 'Mikrotik vessel management endpoints',
          },
          {
            name: 'Mikrotik Usage',
            description: 'Mikrotik usage statistics endpoints',
          },
          {
            name: 'Mikrotik All-time Usage',
            description: 'Mikrotik all-time usage statistics endpoints',
          },
          {
            name: 'Telephony DIDs',
            description: 'Telephony DID management endpoints',
          },
          {
            name: 'Organization',
            description: 'Organization management endpoints',
          },
          {
            name: 'Permissions',
            description: 'Permission management endpoints',
          },
          {
            name: 'RolesPermission',
            description: 'Flattened role permissions endpoints',
          },
          {
            name: 'HR Employee Profile',
            description: 'HR employee profile management endpoints',
          },
          {
            name: 'HR Time Clock',
            description: 'HR time clock operation endpoints',
          },
          {
            name: 'HR Policy',
            description: 'HR policy config endpoints',
          },
          {
            name: 'Crew Voucher',
            description: 'Crew voucher purchase and lookup endpoints',
          },
        ],
        servers: [
          {
            url:
              process.env.NODE_ENV === 'production'
                ? `http://103.147.107.239:${APP_CONFIG.PORT}`
                : `http://103.147.107.239:${APP_CONFIG.PORT}`,
            description:
              process.env.NODE_ENV === 'production'
                ? 'Production server'
                : 'Development server',
          },
          // {
          //   url: 'http://localhost:3000',
          //   description: 'Local development server',
          // },
          // {
          //   url: 'http://103.147.107.239:4001',
          //   description: 'Local development server',
          // },
          {
            url: 'http://45.8.133.216:4001',
            description: 'Production server',
          },
          {
            url: 'http://158.220.119.2:18020',
            description: 'Production server',
          },
        ],
      },
    }),
  )
  .use(corsMiddleware)
  // .use(loggingMiddleware)
  .get('/', () => ({
    success: true,
    message: `Welcome to ${APP_CONFIG.NAME}`,
    version: APP_CONFIG.VERSION,
    documentation: '/swagger',
    endpoints: {
      health: '/api/system/health',
      status: '/api/system/status',
      auth: '/api/auth',
      users: '/api/users',
      userRoles: '/api/user-roles',
      vessels: '/api/vessels',
      vesselGroups: '/api/vessel-groups',
      groupAccess: '/api/group-access',
      starlinkUsage: '/api/starlink-usage',
      bluetideUsage: '/api/bluetide-usage',
      bluetideTelemetry: '/api/bluetide-telemetry',
      mikrotikVessels: '/api/mikrotik-vessels',
      mikrotikUsage: '/api/mikrotik-usage',
      mikrotikAlltimeUsage: '/api/mikrotik-usage-alltime',
      telephonyDids: '/api/telephony-dids',
      organizations: '/api/organizations',
      permissions: '/api/permissions',
      rolesPermissions: '/api/roles-permissions',
      hrEmployeeProfiles: '/api/hr-employee-profiles',
      hrTimeClock: '/api/hr-time-clock',
      hrPolicies: '/api/hr-policies',
      crewVoucher: '/api/crew-voucher',
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
  .use(mikrotikUsageRoutes)
  .use(telephonyDidRoutes)
  .use(pinManagementRoutes)
  .use(permissionRoutes)
  .use(rolesPermissionRoutes)
  .use(organizationRoutes)
  .use(hrEmployeeProfileRoutes)
  .use(hrTimeClockRoutes)
  .use(hrPolicyConfigRoutes)
  .use(crewVoucherRoutes)
  .onError(({ error, code, set }) => {
    console.error('Application error:', error);

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: 'Route not found',
        status: 404,
      };
    }

    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: 'Validation error',
        message: error.message,
        status: 400,
      };
    }

    set.status = 500;
    return {
      success: false,
      error: 'Internal server error',
      status: 500,
    };
  })
  .listen(APP_CONFIG.PORT);

// Initialize database connection and system setup
async function startServer() {
  try {
    await connectDatabase();

    // Run migrations (strict in prod, smart in dev)
    const strictMigrations =
      process.env.NODE_ENV === 'production' ||
      process.env.DB_STRICT_MIGRATIONS === 'true';
    if (strictMigrations) {
      console.log('Running strict migrations...');
      await migrate(db, { migrationsFolder: './src/app/db/migrations' });
      console.log('✅ Strict migrations completed successfully');
    } else {
      // Use smart migration system for local/dev convenience
      await smartMigrate();
    }

    // Initialize system (seed roles and admin)
    await initializeSystem();

    // Initialize materialized views for analytics
    await initializeMaterializedViews();

    // Ensure required tables (dev/backfill safety)
    await ensureSyncState();
    await ensureBluetideTelemetry();
    await ensurePermissions();

    // Sync API permissions from route files to database
    await syncApiPermissions();

    // Populate navigation permissions from permissionsData
    await populatePermissions();

    console.log('✅ Server initialization completed successfully');

    // Start background crons after successful initialization
    startCrons();
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

startServer();

console.log(
  `🦊 ${APP_CONFIG.NAME} is running at http://${app.server?.hostname}:${app.server?.port}`,
);
console.log(
  `📚 API Documentation available at http://${app.server?.hostname}:${app.server?.port}/swagger`,
);
console.log(
  `🏥 Health check available at http://${app.server?.hostname}:${app.server?.port}/api/system/health`,
);
