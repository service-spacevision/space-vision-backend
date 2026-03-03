import { Elysia, t } from 'elysia';
import { CREW_VOUCHER_CONFIG } from '../../app/constants/constants';
import { CrewVoucherController } from '../../app/controllers/crewVoucherControllers/crewVoucherController';

const routeSchema = {
  headers: t.Object({
    // authorization: t.Optional(
    //   t.String({
    //     description: 'Optional bearer token to forward to upstream PI service',
    //     example: 'Bearer <your-token>',
    //   }),
    // ),
  }),
  response: {
    200: t.Object({
      data: t.Object({
        serial: t.String({
          example: CREW_VOUCHER_CONFIG.TEST_ROUTER_SERIAL,
          examples: [CREW_VOUCHER_CONFIG.TEST_ROUTER_SERIAL],
        }),
        online: t.Boolean({ example: true, examples: [true] }),
        cloud_ip: t.Nullable(
          t.String({ example: '209.198.131.55', examples: ['209.198.131.55'] }),
        ),
        uptime: t.Nullable(
          t.String({ example: '378614', examples: ['378614'] }),
        ),
        vessel_id: t.Number({
          example: CREW_VOUCHER_CONFIG.TEST_VESSEL_ID,
          examples: [CREW_VOUCHER_CONFIG.TEST_VESSEL_ID],
        }),
        vessel_uuid: t.Nullable(
          t.String({
            example: 'ff7f110d-8a5b-45c2-84e3-f68d7ac303db',
            examples: ['ff7f110d-8a5b-45c2-84e3-f68d7ac303db'],
          }),
        ),
        vessel_name: t.Nullable(
          t.String({ example: 'SVS Justice', examples: ['SVS Justice'] }),
        ),
        customer_id: t.Nullable(t.Number({ example: 2, examples: [2] })),
        customer_name: t.Nullable(
          t.String({
            example: 'Seanetlink Limited',
            examples: ['Seanetlink Limited'],
          }),
        ),
      }),
    }),
    400: t.Object({
      error: t.String({
        example: 'Invalid serial number',
        examples: ['Invalid serial number'],
      }),
    }),
    404: t.Object({
      error: t.String({
        example: 'Router not found or not linked to an active vessel',
        examples: ['Router not found or not linked to an active vessel'],
      }),
    }),
    500: t.Object({
      error: t.String({
        example: 'Internal server error',
        examples: ['Internal server error'],
      }),
    }),
    502: t.Object({
      error: t.String({
        example: 'Failed to contact upstream crew voucher service',
        examples: ['Failed to contact upstream crew voucher service'],
      }),
    }),
  },
  tags: ['Crew Voucher'],
  detail: {
    summary: 'Validate router serial',
    description: `Proxies router-serial validation to upstream PI service and returns vessel context for portal UI. Upstream test URL: ${CREW_VOUCHER_CONFIG.TEST_ROUTER_LOOKUP_URL}`,
    operationId: 'validateCrewVoucherRouterSerial',
  },
};

const crewVoucherRoute = new Elysia({ prefix: '/api/crew-voucher' }).get(
  '/router',
  CrewVoucherController.validateRouterSerial,
  {
  ...routeSchema,
  query: t.Object({
    serial: t.String({
      description: 'Router serial from query string',
      example: CREW_VOUCHER_CONFIG.TEST_ROUTER_SERIAL,
    }),
  }),
  detail: {
    ...routeSchema.detail,
    operationId: 'validateCrewVoucherRouterSerialQuery',
  },
})
.post('/profiles', CrewVoucherController.createOrUpdateCrewProfile, {
  headers: t.Object({
    authorization: t.Optional(
      t.String({
        description: 'Optional bearer token to forward to upstream PI service',
        example: 'Bearer <your-token>',
      }),
    ),
  }),
  body: t.Object({
    vessel_id: t.Optional(
      t.Union([t.Number(), t.String(), t.Null()], {
        description: 'Vessel ID',
        example: CREW_VOUCHER_CONFIG.TEST_VESSEL_ID,
      }),
    ),
    full_name: t.Optional(
      t.Union([t.String(), t.Null()], {
        description: 'Crew full name',
        example: 'Jane Doe',
      }),
    ),
    email: t.Optional(
      t.String({
        description: 'Crew email',
        example: 'jane.doe@example.com',
      }),
    ),
    phone: t.Optional(
      t.String({
        description: 'Crew phone',
        example: '+31612345678',
      }),
    ),
    cabin_number: t.Optional(
      t.String({
        description: 'Cabin number',
        example: 'B-05',
      }),
    ),
    rank: t.Optional(
      t.String({
        description: 'Crew rank',
        example: 'Second Officer',
      }),
    ),
  }),
  response: {
    200: t.Object({
      data: t.Object({
        id: t.Number({ example: 2 }),
        vessel_id: t.Number({ example: CREW_VOUCHER_CONFIG.TEST_VESSEL_ID }),
        full_name: t.String({ example: 'Jane Doe Updated' }),
        email: t.Nullable(t.String({ example: 'jane.doe@example.com' })),
        phone: t.Nullable(t.String({ example: '+31612345678' })),
        cabin_number: t.Nullable(t.String({ example: 'B-05' })),
        rank: t.Nullable(t.String({ example: 'Chief Officer' })),
        created_at: t.String({ example: '2026-02-28T18:52:52.728Z' }),
        updated_at: t.String({ example: '2026-02-28T19:02:52.728Z' }),
      }),
    }),
    201: t.Object({
      data: t.Object({
        id: t.Number({ example: 2 }),
        vessel_id: t.Number({ example: CREW_VOUCHER_CONFIG.TEST_VESSEL_ID }),
        full_name: t.String({ example: 'Jane Doe' }),
        email: t.Nullable(t.String({ example: 'jane.doe@example.com' })),
        phone: t.Nullable(t.String({ example: '+31612345678' })),
        cabin_number: t.Nullable(t.String({ example: 'B-05' })),
        rank: t.Nullable(t.String({ example: 'Second Officer' })),
        created_at: t.String({ example: '2026-02-28T18:52:52.728Z' }),
        updated_at: t.String({ example: '2026-02-28T18:52:52.728Z' }),
      }),
    }),
    400: t.Object({
      error: t.String({
        example: 'vessel_id is required',
        examples: [
          'vessel_id is required',
          'vessel_id must be a positive number',
          'full_name is required',
        ],
      }),
    }),
    404: t.Object({
      error: t.String({
        example: 'Vessel not found',
      }),
    }),
    502: t.Object({
      error: t.String({
        example: 'Failed to contact upstream crew voucher service',
      }),
    }),
  },
  tags: ['Crew Voucher'],
  detail: {
    summary: 'Create or update crew profile',
    description:
      'Creates a new crew profile. If the same email already exists on the same vessel, upstream service updates the profile.',
    operationId: 'createOrUpdateCrewVoucherProfile',
  },
})
.get('/packages', CrewVoucherController.listAvailablePackages, {
  headers: t.Object({
    authorization: t.Optional(
      t.String({
        description: 'Optional bearer token to forward to upstream PI service',
        example: 'Bearer <your-token>',
      }),
    ),
  }),
  query: t.Object({
    vessel_id: t.Optional(
      t.Union([t.Number(), t.String(), t.Null()], {
        description: 'Vessel ID',
        example: CREW_VOUCHER_CONFIG.TEST_VESSEL_ID,
      }),
    ),
  }),
  response: {
    200: t.Object({
      data: t.Array(
        t.Object({
          id: t.Number({ example: 1 }),
          name: t.String({ example: '24h Basic WiFi' }),
          description: t.Nullable(
            t.String({ example: '24 hours of basic internet access' }),
          ),
          price_cents: t.Number({ example: 500 }),
          currency: t.String({ example: 'USD' }),
          duration_hours: t.Number({ example: 24 }),
          data_limit_mb: t.Nullable(t.Number({ example: 1024 })),
          speed_limit_kbps: t.Nullable(t.Number()),
        }),
      ),
    }),
    400: t.Object({
      error: t.String({
        example: 'vessel_id is required',
        examples: [
          'vessel_id is required',
          'vessel_id must be a positive number',
        ],
      }),
    }),
    502: t.Object({
      error: t.String({
        example: 'Failed to contact upstream crew voucher service',
      }),
    }),
  },
  tags: ['Crew Voucher'],
  detail: {
    summary: 'List available packages',
    description:
      'Returns active voucher packages for a vessel. Inactive packages are hidden by upstream service.',
    operationId: 'listCrewVoucherPackages',
  },
});

export default crewVoucherRoute;
