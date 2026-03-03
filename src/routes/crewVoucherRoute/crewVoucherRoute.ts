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
});

export default crewVoucherRoute;
