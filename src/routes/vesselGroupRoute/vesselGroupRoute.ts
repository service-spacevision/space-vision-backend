import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { VesselGroupController } from '../../app/controllers/vesselGroupControllers/vesselGroupController'
import { checkUser } from '../../app/middlewares/permissions'
import { CreateVesselGroupSchema, UpdateVesselGroupSchema } from '../../app/models/VesselGroup'

const permission = {
  "GET_/api/vessel-groups": "read_vessel_groups",
  "POST_/api/vessel-groups": "create_vessel_group",
  "PUT_/api/vessel-groups": "update_vessel_group",
  "DELETE_/api/vessel-groups": "delete_vessel_group"
}

const vesselGroupRoute = new Elysia({ prefix: '/api/vessel-groups' })
  .use(cookie())
  .get('/', VesselGroupController.getVesselGroups, {
    beforeHandle: [checkUser(permission["GET_/api/vessel-groups"])],
    query: t.Object({
      groupName: t.Optional(t.String({
        description: 'Filter by group name'
      }))
    }),
    tags: ['Vessel Groups'],
    detail: {
      summary: 'Get vessel groups',
      description: 'Retrieve vessel groups with optional filtering',
      operationId: 'getVesselGroups',
    },
  })

  .post('/', VesselGroupController.createVesselGroup, {
    beforeHandle: [checkUser(permission["POST_/api/vessel-groups"])],
    body: CreateVesselGroupSchema,
    tags: ['Vessel Groups'],
    detail: {
      summary: 'Create vessel group',
      description: 'Create a new vessel group',
      operationId: 'createVesselGroup',
    }
  })

  .put('/', VesselGroupController.updateVesselGroup, {
    beforeHandle: [checkUser(permission["PUT_/api/vessel-groups"])],
    query: t.Object({
      groupName: t.String({
        description: 'Group name to update'
      })
    }),
    body: UpdateVesselGroupSchema,
    tags: ['Vessel Groups'],
    detail: {
      summary: 'Update vessel group',
      description: 'Update an existing vessel group',
      operationId: 'updateVesselGroup',
    }
  })

  .delete('/', VesselGroupController.deleteVesselGroup, {
    beforeHandle: [checkUser(permission["DELETE_/api/vessel-groups"])],
    query: t.Object({
      groupName: t.String({
        description: 'Group name to delete'
      })
    }),
    tags: ['Vessel Groups'],
    detail: {
      summary: 'Delete vessel group',
      description: 'Delete an existing vessel group',
      operationId: 'deleteVesselGroup',
    }
  })

export default vesselGroupRoute