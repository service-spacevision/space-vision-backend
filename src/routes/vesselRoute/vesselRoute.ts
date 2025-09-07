import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { VesselController } from '../../app/controllers/vesselControllers/vesselController'
import { checkUser } from '../../app/middlewares/permissions'
import { CreateVesselSchema, UpdateVesselSchema } from '../../app/models/Vessel'

const permission = {
  "GET_/api/vessels": "read_vessels",
  "GET_/api/vessels/grouped": "read_vessels",
  "GET_/api/vessels/group": "read_vessels",
  "POST_/api/vessels": "create_vessel",
  "PUT_/api/vessels": "update_vessel",
  "DELETE_/api/vessels": "delete_vessel"
}

const vesselRoute = new Elysia({ prefix: '/api/vessels' })
  .use(cookie())
  .get('/grouped', VesselController.getAllVesselsGrouped, {
    beforeHandle: [checkUser(permission["GET_/api/vessels/grouped"])],
    tags: ['Vessels'],
    detail: {
      summary: 'Get all vessels grouped by vessel groups',
      description: 'Fetches all vessels organized by their vessel groups',
      operationId: 'getAllVesselsGrouped',
    },
  })

  .get('/group', VesselController.getVesselsByGroupId, {
    beforeHandle: [checkUser(permission["GET_/api/vessels/group"])],
    query: t.Object({
      groupId: t.String({
        description: 'Group ID to filter vessels by'
      })
    }),
    tags: ['Vessels'],
    detail: {
      summary: 'Get vessels by group ID',
      description: 'Fetches all vessels belonging to a specific group',
      operationId: 'getVesselsByGroupId',
    },
  })
  
  .get('/', VesselController.getVessels, {
    beforeHandle: [checkUser(permission["GET_/api/vessels"])],
    query: t.Object({
      name: t.Optional(t.String({
        description: 'Filter by vessel name'
      })),
      groupId: t.Optional(t.String({
        description: 'Filter by group ID'
      })),
      subscriptionPlan: t.Optional(t.String({
        description: 'Filter by subscription plan'
      })),
      currentPage: t.Optional(t.String({
        description: 'Current Page number',
        default: "1"
      })),
      pageSize: t.Optional(t.String({
        description: 'Number of items per page',
        default: "10"
      })),
      all: t.Optional(t.String({
        description: 'Retrieve all vessels (true/false)',
        default: "false"
      }))
    }),
    tags: ['Vessels'],
    detail: {
      summary: 'Get vessels',
      description: 'Retrieve vessels with optional filtering and pagination',
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
      id: t.String({
        description: 'Vessel ID to update'
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
      id: t.String({
        description: 'Vessel ID to delete'
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