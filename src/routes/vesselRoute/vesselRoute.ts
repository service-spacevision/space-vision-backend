import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { VesselController } from '../../app/controllers/vesselControllers/vesselController'
import { checkUser } from '../../app/middlewares/permissions'
import { CreateVesselSchema, UpdateVesselSchema, VesselResponseSchema } from '../../app/models/Vessel'

const permission = {
  "GET_/api/vessels": "read_vessels",
  "POST_/api/vessels": "create_vessel",
  "PUT_/api/vessels": "update_vessel",
  "DELETE_/api/vessels": "delete_vessel"
}

const vesselRoute = new Elysia({ prefix: '/api/vessels' })
  .use(cookie())
  .get('/', VesselController.getVessels, {
    beforeHandle: [checkUser(permission["GET_/api/vessels"])],
    query: t.Object({
      vesselsKitNumber: t.Optional(t.String({
        description: 'Filter by vessel kit number'
      })),
      groupName: t.Optional(t.String({
        description: 'Filter by group name'
      }))
    }),
    tags: ['Vessels'],
    detail: {
      summary: 'Get vessels',
      description: 'Retrieve vessels with optional filtering',
      operationId: 'getVessels',
    },
  })

  .post('/', VesselController.createVessel, {
    beforeHandle: [checkUser(permission["POST_/api/vessels"])],
    body: CreateVesselSchema,
    tags: ['Vessels'],
    detail: {
      summary: 'Create vessel',
      description: 'Create a new vessel',
      operationId: 'createVessel',
    }
  })

  .put('/', VesselController.updateVessel, {
    beforeHandle: [checkUser(permission["PUT_/api/vessels"])],
    query: t.Object({
      vesselsKitNumber: t.String({
        description: 'Vessel kit number to update'
      })
    }),
    body: UpdateVesselSchema,
    tags: ['Vessels'],
    detail: {
      summary: 'Update vessel',
      description: 'Update an existing vessel',
      operationId: 'updateVessel',
    }
  })

  .delete('/', VesselController.deleteVessel, {
    beforeHandle: [checkUser(permission["DELETE_/api/vessels"])],
    query: t.Object({
      vesselsKitNumber: t.String({
        description: 'Vessel kit number to delete'
      })
    }),
    tags: ['Vessels'],
    detail: {
      summary: 'Delete vessel',
      description: 'Delete an existing vessel',
      operationId: 'deleteVessel',
    }
  })

export default vesselRoute