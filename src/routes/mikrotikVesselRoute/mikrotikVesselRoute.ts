import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { MikrotikVesselController } from '../../app/controllers/mikrotikVesselControllers/mikrotikVesselController'
import { checkUser } from '../../app/middlewares/permissions'
import { CreateMikrotikVesselSchema, UpdateMikrotikVesselSchema } from '../../app/models/MikrotikVessel'

const permission = {
  "GET_/api/mikrotik-vessels": "read_mikrotik_vessels",
  "POST_/api/mikrotik-vessels": "create_mikrotik_vessel",
  "PUT_/api/mikrotik-vessels": "update_mikrotik_vessel",
  "DELETE_/api/mikrotik-vessels": "delete_mikrotik_vessel"
}

const mikrotikVesselRoute = new Elysia({ prefix: '/api/mikrotik-vessels' })
  .use(cookie())
  .get('/', MikrotikVesselController.getMikrotikVessels, {
    beforeHandle: [checkUser(permission["GET_/api/mikrotik-vessels"])],
    query: t.Object({
      vesselName: t.Optional(t.String({
        description: 'Filter by vessel name'
      })),
      routerIp: t.Optional(t.String({
        description: 'Filter by router IP'
      }))
    }),
    tags: ['Mikrotik Vessels'],
    detail: {
      summary: 'Get mikrotik vessels',
      description: 'Retrieve mikrotik vessels with optional filtering',
      operationId: 'getMikrotikVessels',
    },
  })

  .post('/', MikrotikVesselController.createMikrotikVessel, {
    beforeHandle: [checkUser(permission["POST_/api/mikrotik-vessels"])],
    body: CreateMikrotikVesselSchema,
    tags: ['Mikrotik Vessels'],
    detail: {
      summary: 'Create mikrotik vessel',
      description: 'Create a new mikrotik vessel',
      operationId: 'createMikrotikVessel',
    }
  })

  .put('/', MikrotikVesselController.updateMikrotikVessel, {
    beforeHandle: [checkUser(permission["PUT_/api/mikrotik-vessels"])],
    query: t.Object({
      vesselName: t.String({
        description: 'Vessel name to update'
      })
    }),
    body: UpdateMikrotikVesselSchema,
    tags: ['Mikrotik Vessels'],
    detail: {
      summary: 'Update mikrotik vessel',
      description: 'Update an existing mikrotik vessel',
      operationId: 'updateMikrotikVessel',
    }
  })

  .delete('/', MikrotikVesselController.deleteMikrotikVessel, {
    beforeHandle: [checkUser(permission["DELETE_/api/mikrotik-vessels"])],
    query: t.Object({
      vesselName: t.String({
        description: 'Vessel name to delete'
      })
    }),
    tags: ['Mikrotik Vessels'],
    detail: {
      summary: 'Delete mikrotik vessel',
      description: 'Delete an existing mikrotik vessel',
      operationId: 'deleteMikrotikVessel',
    }
  })

export default mikrotikVesselRoute