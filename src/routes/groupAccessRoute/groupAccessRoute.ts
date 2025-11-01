import { Elysia, t } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { GroupAccessController } from '../../app/controllers/groupAccessControllers/groupAccessController';
import { checkUser } from '../../app/middlewares/permissions';
import {
  CreateGroupAccessSchema,
  UpdateGroupAccessSchema,
} from '../../app/models/GroupAccess';

const permission = {
  'GET_/api/group-access': 'read_group_access',
  'POST_/api/group-access': 'create_group_access',
  'PUT_/api/group-access': 'update_group_access',
  'DELETE_/api/group-access': 'delete_group_access',
  'PUT_/api/mikrotik-access': 'update_mikrotik_access',
  'GET_/api/mikrotik-access': 'read_mikrotik_access',
};

const groupAccessRoute = new Elysia({ prefix: '/api/group-access' })
  .use(cookie())
  .get('/', GroupAccessController.getGroupAccess, {
    beforeHandle: [checkUser(permission['GET_/api/group-access'])],
    query: t.Object({
      role: t.Optional(
        t.String({
          description: 'Filter by role',
        })
      ),
      groupId: t.Optional(
        t.String({
          description: 'Filter by group ID',
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
          description: 'Retrieve all group access (true/false)',
          default: 'false',
        })
      ),
    }),
    tags: ['Group Access'],
    detail: {
      summary: 'Get group access',
      description: 'Retrieve group access with optional filtering',
      operationId: 'getGroupAccess',
    },
  })

  .get('/mikrotik', GroupAccessController.getMikrotikVesselAccess, {
    beforeHandle: [checkUser(permission['GET_/api/mikrotik-access'])],
    query: t.Object({
      role: t.Optional(
        t.String({
          description: 'Filter by role',
        })
      ),
      vesselId: t.Optional(
        t.String({
          description: 'Filter by vessel ID',
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
          description: 'Retrieve all group access (true/false)',
          default: 'false',
        })
      ),
    }),
    tags: ['Mikrotik Access'],
    detail: {
      summary: 'Get mikrotik access',
      description: 'Retrieve mikrotik access with optional filtering',
      operationId: 'getMikrotikVesselAccess',
    },
  })

  .post('/', GroupAccessController.createGroupAccess, {
    beforeHandle: [checkUser(permission['POST_/api/group-access'])],
    body: CreateGroupAccessSchema,
    tags: ['Group Access'],
    detail: {
      summary: 'Create group access',
      description: 'Create a new group access',
      operationId: 'createGroupAccess',
    },
  })

  .put('/', GroupAccessController.updateGroupAccess, {
    beforeHandle: [checkUser(permission['PUT_/api/group-access'])],
    body: t.Object({
      groupIds: t.Array(t.Number(), {
        description: 'Array of group IDs to grant access to',
        examples: [[1, 2, 3]],
      }),
    }),
    query: t.Object({
      role: t.String({
        description: 'Role ID to update access for',
        examples: ['1'],
      }),
    }),
    tags: ['Group Access'],
    detail: {
      summary: 'Update group access for a role',
      description:
        'Updates the list of groups that a role has access to. This will replace any existing group access for the role.',
      operationId: 'updateGroupAccess',
    },
  })

  .put('/mikrotik', GroupAccessController.updateMikrotikAccess, {
    beforeHandle: [checkUser(permission['PUT_/api/mikrotik-access'])],
    body: t.Object({
      vesselIds: t.Array(t.Number(), {
        description: 'Array of vessel IDs to grant access to',
        examples: [[1, 2, 3]],
      }),
    }),
    query: t.Object({
      role: t.String({
        description: 'Role ID to update access for',
        examples: ['1'],
      }),
    }),
    tags: ['Group Access'],
    detail: {
      summary: 'Update Mikrotik access for a role',
      description:
        'Updates the list of mikrotik vessels that a role has access to. This will replace any existing group access for the role.',
      operationId: 'updateMikrotikAccess',
    },
  })

  .delete('/', GroupAccessController.deleteGroupAccess, {
    beforeHandle: [checkUser(permission['DELETE_/api/group-access'])],
    query: t.Object({
      role: t.String({
        description: 'Role ID for which to delete all group access',
        examples: ['1'],
      }),
    }),
    tags: ['Group Access'],
    detail: {
      summary: 'Delete group access',
      description: 'Delete an existing group access',
      operationId: 'deleteGroupAccess',
    },
  });

export { permission };
export default groupAccessRoute;
