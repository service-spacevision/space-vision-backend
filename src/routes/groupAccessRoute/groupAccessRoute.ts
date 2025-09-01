import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { GroupAccessController } from '../../app/controllers/groupAccessControllers/groupAccessController'
import { checkUser } from '../../app/middlewares/permissions'
import { CreateGroupAccessSchema, UpdateGroupAccessSchema } from '../../app/models/GroupAccess'

const permission = {
  "GET_/api/group-access": "read_group_access",
  "POST_/api/group-access": "create_group_access",
  "PUT_/api/group-access": "update_group_access",
  "DELETE_/api/group-access": "delete_group_access"
}

const groupAccessRoute = new Elysia({ prefix: '/api/group-access' })
  .use(cookie())
  .get('/', GroupAccessController.getGroupAccess, {
    beforeHandle: [checkUser(permission["GET_/api/group-access"])],
    query: t.Object({
      role: t.Optional(t.String({
        description: 'Filter by role'
      })),
      groupId: t.Optional(t.String({
        description: 'Filter by group ID'
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
        description: 'Retrieve all group access (true/false)',
        default: "false"
      }))
    }),
    tags: ['Group Access'],
    detail: {
      summary: 'Get group access',
      description: 'Retrieve group access with optional filtering',
      operationId: 'getGroupAccess',
    },
  })

  .post('/', GroupAccessController.createGroupAccess, {
    beforeHandle: [checkUser(permission["POST_/api/group-access"])],
    body: CreateGroupAccessSchema,
    tags: ['Group Access'],
    detail: {
      summary: 'Create group access',
      description: 'Create a new group access',
      operationId: 'createGroupAccess',
    }
  })

  .put('/', GroupAccessController.updateGroupAccess, {
    beforeHandle: [checkUser(permission["PUT_/api/group-access"])],
    query: t.Object({
      role: t.String({
        description: 'Role to update'
      }),
      groupId: t.String({
        description: 'Group ID to update'
      })
    }),
    body: UpdateGroupAccessSchema,
    tags: ['Group Access'],
    detail: {
      summary: 'Update group access',
      description: 'Update an existing group access',
      operationId: 'updateGroupAccess',
    }
  })

  .delete('/', GroupAccessController.deleteGroupAccess, {
    beforeHandle: [checkUser(permission["DELETE_/api/group-access"])],
    query: t.Object({
      role: t.String({
        description: 'Role to delete'
      }),
      groupId: t.String({
        description: 'Group ID to delete'
      })
    }),
    tags: ['Group Access'],
    detail: {
      summary: 'Delete group access',
      description: 'Delete an existing group access',
      operationId: 'deleteGroupAccess',
    }
  })

export default groupAccessRoute