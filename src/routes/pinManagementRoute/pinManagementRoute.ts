import { Elysia, t } from 'elysia';
import { PinManagementController } from '../../app/controllers/pinManagementControllers/pinManagementController';
import { checkUser } from '../../app/middlewares/permissions';
import { cookie } from '@elysiajs/cookie';

const permission = {
  'POST_/api/pin-management/generate': 'generate_pins',
  'GET_/api/pin-management/pins': 'view_pins',
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
            MIKROTIK: 'mikrotik',
            OTHER: 'other',
          },
          {
            description: 'Filter by pin type',
          }
        )
      ),
      vessel_id: t.Optional(
        t.String({
          description: 'Filter by vessel ID',
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
  });

export { permission };
export default pinManagementRoute;
