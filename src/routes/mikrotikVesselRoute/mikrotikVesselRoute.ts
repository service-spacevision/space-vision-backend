import { Elysia, t } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { MikrotikVesselController } from '../../app/controllers/mikrotikVesselControllers/mikrotikVesselController';
import { checkUser } from '../../app/middlewares/permissions';
import {
  CreateMikrotikVesselSchema,
  UpdateMikrotikVesselSchema,
} from '../../app/models/MikrotikVessel';

const permission = {
  'GET_/api/mikrotik-vessels': 'read_mikrotik_vessels',
  'POST_/api/mikrotik-vessels': 'create_mikrotik_vessel',
  'PUT_/api/mikrotik-vessels': 'update_mikrotik_vessel',
  'DELETE_/api/mikrotik-vessels': 'delete_mikrotik_vessel',
};

const mikrotikVesselRoute = new Elysia({ prefix: '/api/mikrotik-vessels' })
  .use(cookie())
  .get('/', MikrotikVesselController.getMikrotikVessels, {
    beforeHandle: [checkUser(permission['GET_/api/mikrotik-vessels'])],
    query: t.Object({
      vesselName: t.Optional(
        t.String({
          description: 'Filter by vessel name',
        })
      ),
      routerIp: t.Optional(
        t.String({
          description: 'Filter by router IP',
        })
      ),
      currentPage: t.Optional(
        t.String({
          description: 'Current Page number',
          default: '1',
        })
      ),
      pageSize: t.Optional(
        t.String({
          description: 'Number of items per page',
          default: '10',
        })
      ),
      all: t.Optional(
        t.String({
          description: 'Retrieve all mikrotik vessels (true/false)',
          default: 'false',
        })
      ),
    }),
    tags: ['Mikrotik Vessels'],
    detail: {
      summary: 'Get mikrotik vessels',
      description: 'Retrieve mikrotik vessels with optional filtering',
      operationId: 'getMikrotikVessels',
    },
  })

  .post('/', MikrotikVesselController.createMikrotikVessel, {
    beforeHandle: [checkUser(permission['POST_/api/mikrotik-vessels'])],
    body: CreateMikrotikVesselSchema,
    tags: ['Mikrotik Vessels'],
    detail: {
      summary: 'Create mikrotik vessel',
      description: 'Create a new mikrotik vessel',
      operationId: 'createMikrotikVessel',
    },
  })

  .put('/', MikrotikVesselController.updateMikrotikVessel, {
    beforeHandle: [checkUser(permission['PUT_/api/mikrotik-vessels'])],
    query: t.Object({
      vesselName: t.String({
        description: 'Vessel name to update',
      }),
    }),
    body: UpdateMikrotikVesselSchema,
    tags: ['Mikrotik Vessels'],
    detail: {
      summary: 'Update mikrotik vessel',
      description: 'Update an existing mikrotik vessel',
      operationId: 'updateMikrotikVessel',
    },
  })

  .delete('/', MikrotikVesselController.deleteMikrotikVessel, {
    beforeHandle: [checkUser(permission['DELETE_/api/mikrotik-vessels'])],
    query: t.Object({
      vesselName: t.String({
        description: 'Vessel name to delete',
      }),
    }),
    tags: ['Mikrotik Vessels'],
    detail: {
      summary: 'Delete mikrotik vessel',
      description: 'Delete an existing mikrotik vessel',
      operationId: 'deleteMikrotikVessel',
    },
  })
  .get(
    '/profiles-and-servers',
    MikrotikVesselController.getVesselProfilesAndServers,
    {
      beforeHandle: [checkUser(permission['GET_/api/mikrotik-vessels'])],
      query: t.Object({
        vesselId: t.String({
          description: 'ID of the vessel to get profiles and servers for',
        }),
      }),
      tags: ['Mikrotik Vessels'],
      detail: {
        summary: 'Get profiles and servers for a vessel',
        description:
          'Retrieves the hotspot profiles and servers for a specific vessel',
        operationId: 'getVesselProfilesAndServers',
      },
    }
  );

export { permission };
export default mikrotikVesselRoute;
