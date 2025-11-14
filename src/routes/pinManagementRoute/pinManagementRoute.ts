import { Elysia, t } from 'elysia';
import { PinManagementController } from '../../app/controllers/pinManagementControllers/pinManagementController';
import { checkUser } from '../../app/middlewares/permissions';
import { cookie } from '@elysiajs/cookie';

const permission = {
  'POST_/api/pin-management/generate': 'generate_pins',
  'GET_/api/pin-management/pins': 'view_pins',
  'GET_/api/pin-management/mikrotik-users': 'view_mikrotik_users',
  'GET_/api/pin-management/test-connection': 'test_mikrotik_connection',
  'GET_/api/pin-management/sync-mikrotik-users': 'sync_mikrotik_users',
  'POST_/api/pin-management/crew-login': 'crew_login',
  'POST_/api/pin-management/system-login': 'system_login',
};

const pinManagementRoute = new Elysia({ prefix: '/api/pin-management' })
  .use(cookie())

  // Get all pins with pagination and filtering
  .get('/pins', PinManagementController.getPins, {
    beforeHandle: [checkUser(permission['GET_/api/pin-management/pins'])],
    query: t.Object({
      page: t.Optional(
        t.String({
          description: 'Current page number',
          default: '1',
        })
      ),
      pageSize: t.Optional(
        t.String({
          description: 'Number of items per page',
          default: '10',
        })
      ),
      type: t.Optional(
        t.Enum(
          {
            CREW: 'crew',
            SYSTEM: 'system',
          },
          {
            description: 'Filter by permission type (crew or system)',
          }
        )
      ),
      vessel_id: t.Optional(
        t.String({
          description: 'Filter by vessel ID',
        })
      ),
      username: t.Optional(
        t.String({
          description: 'Filter by username (case insensitive partial match)',
        })
      ),
      vessel_name: t.Optional(
        t.String({
          description: 'Filter by vessel name (case insensitive partial match)',
        })
      ),
    }),
    tags: ['Pin Management'],
    detail: {
      summary: 'Get all pins with pagination and filtering',
      description:
        'Retrieves paginated list of pins with their associated vessel and generator information. Can be filtered by type and vessel.',
      operationId: 'getAllPins',
    },
  })

  // Generate new pins
  .post('/generate', PinManagementController.generatePin, {
    beforeHandle: [checkUser(permission['POST_/api/pin-management/generate'])],
    body: t.Union([
      // Non-MikroTik pin request
      t.Object(
        {
          type: t.Literal('other'),
          vessel_id: t.Number({
            description: 'ID of the vessel (required for non-MikroTik pins)',
            examples: [1, 2, 3],
          }),
          vessel_name: t.Optional(
            t.String({
              description:
                'Name of the vessel (optional for non-MikroTik pins)',
              examples: ['Vessel 1', 'Vessel 2'],
            })
          ),
          kitp: t.String({
            description: 'KITP number (required for non-MikroTik pins)',
            examples: ['KITP123456'],
          }),
          number_of_pins_to_generate: t.Number({
            description: 'Number of pins to generate (1-50)',
            minimum: 1,
            maximum: 50,
            examples: [5],
          }),
          access_type: t.Enum(
            {
              CREW: 'crew',
              SYSTEM: 'system',
            },
            {
              description: 'Access type for the pin',
              default: 'crew',
            }
          ),
        },
        {
          title: 'Non-MikroTik pin request',
        }
      ),

      // MikroTik pin request
      t.Object(
        {
          type: t.Literal('mikrotik'),
          vessel_id: t.Number({
            description: 'ID of the MikroTik vessel',
            examples: [1, 2, 3],
          }),
          mikrotik_user_name: t.Optional(
            t.String({
              description: 'MikroTik username (optional for MikroTik pins)',
              examples: ['user1', 'user2'],
            })
          ),
          vessel_name: t.String({
            description: 'Name of the MikroTik vessel',
            examples: ['Vessel 1', 'Vessel 2'],
          }),
          number_of_pins_to_generate: t.Number({
            description: 'Number of pins to generate (1-50)',
            minimum: 1,
            maximum: 50,
            examples: [5],
          }),
          access_type: t.Enum(
            {
              CREW: 'crew',
              SYSTEM: 'system',
            },
            {
              description: 'Access type for the pin',
              default: 'crew',
            }
          ),
        },
        { title: 'MikroTik pin request' }
      ),
    ]),
    tags: ['Pin Management'],
    detail: {
      summary: 'Generate pins for a vessel',
      description:
        'Generates random usernames and passwords, stores them in the database, and returns the generated credentials. ' +
        'Supports both MikroTik and non-MikroTik pins.',
      operationId: 'generatePins',
    },
  })

  // Get MikroTik hotspot users
  .get('/mikrotik-users', PinManagementController.listMikrotikUsers, {
    beforeHandle: [
      checkUser(permission['GET_/api/pin-management/mikrotik-users']),
    ],
    query: t.Object({
      vessel_id: t.String({
        description: 'ID of the MikroTik vessel',
        examples: ['1', '2', '3'],
      }),
      server_name: t.Optional(
        t.String({
          description: 'Filter by hotspot server name',
          examples: ['hotspot1', 'hotspot2'],
        })
      ),
      profile: t.Optional(
        t.String({
          description: 'Filter by user profile',
          examples: ['General', 'General 30d'],
        })
      ),
      limit: t.Optional(
        t.String({
          description: 'Maximum number of users to retrieve',
          default: '200',
        })
      ),
    }),
    tags: ['Pin Management'],
    detail: {
      summary: 'Get MikroTik hotspot users',
      description:
        'Retrieves hotspot users directly from the MikroTik router for a specific vessel. ' +
        'Can be filtered by server name, profile, and limited by count.',
      operationId: 'listMikrotikUsers',
    },
  })

  // Test MikroTik connection
  .get('/test-connection', PinManagementController.testMikrotikConnection, {
    beforeHandle: [
      checkUser(permission['GET_/api/pin-management/test-connection']),
    ],
    query: t.Object({
      vessel_id: t.String({
        description: 'ID of the MikroTik vessel to test',
        examples: ['1', '2', '3'],
      }),
    }),
    tags: ['Pin Management'],
    detail: {
      summary: 'Test MikroTik router connection',
      description:
        'Tests connectivity to a MikroTik router and validates API functionality. ' +
        'Useful for diagnosing connection issues and verifying router configuration.',
      operationId: 'testMikrotikConnection',
    },
  })

  // Sync MikroTik users
  .get('/sync-mikrotik-users', PinManagementController.syncMikrotikUsers, {
    beforeHandle: [
      checkUser(permission['GET_/api/pin-management/sync-mikrotik-users']),
    ],
    tags: ['Pin Management'],
    detail: {
      summary: 'Sync MikroTik users',
      description:
        'Syncs MikroTik users from all vessels and stores them in the database.',
      operationId: 'syncMikrotikUsers',
    },
  });

export { permission };
export default pinManagementRoute;
