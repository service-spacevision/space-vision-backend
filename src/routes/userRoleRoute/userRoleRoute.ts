import { Elysia, t } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { UserRoleController } from '../../app/controllers/userRoleControllers/userRoleController';
import { checkUser } from '../../app/middlewares/permissions';
import {
  CreateUserRoleSchema,
  UpdateUserRoleSchema,
  UserRoleResponseSchema,
} from '../../app/models/UserRole';

const permission = {
  'POST_/api/user-roles': 'create_user_role',
  'GET_/api/user-roles': 'read_user_roles',
  'GET_/api/user-roles/:id': 'read_user_role',
  'PUT_/api/user-roles/:id': 'update_user_role',
  'DELETE_/api/user-roles/:id': 'delete_user_role',
  'GET_/api/user-roles/by-id': 'read_user_role_by_id',
  'GET_/api/user-roles/get-logged-user-role': 'read_logged_user_role',
  'PUT_/api/user-roles/update': 'update_user_role',
  'DELETE_/api/user-roles/delete': 'delete_user_role',
};

const userRoleRoute = new Elysia({ prefix: '/api/user-roles' })
  .use(cookie())
  .post('/', UserRoleController.createRole, {
    beforeHandle: [checkUser(permission['POST_/api/user-roles'])],
    body: CreateUserRoleSchema,
    tags: ['UserRole'],
    detail: {
      description: 'Create a new user role with permissions',
      operationId: 'createUserRole',
      summary: 'Create a new user role with permissions',
    },
  })

  .get('/', UserRoleController.getRoles, {
    beforeHandle: [checkUser(permission['GET_/api/user-roles'])],
    query: t.Object({
      includeInactive: t.Optional(
        t.String({
          description: 'Include inactive roles (true/false)',
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
          description: 'Retrieve all user roles (true/false)',
          default: 'false',
        })
      ),
      search: t.Optional(
        t.String({
          description: 'Search by role name or display name',
        })
      ),
    }),
    tags: ['UserRole'],
    detail: {
      summary: 'Get user roles',
      description: 'Retrieve all user roles with optional search functionality',
      operationId: 'getUserRoles',
    },
  })

  .get('/by-id', UserRoleController.getRoleById, {
    beforeHandle: [checkUser(permission['GET_/api/user-roles/by-id'])],
    query: t.Object({
      id: t.String({
        description: 'User role ID',
      }),
    }),
    tags: ['UserRole'],
    detail: {
      summary: 'Get user role by ID',
      description: 'Retrieve a specific user role by ID',
      operationId: 'getUserRoleById',
    },
  })

  .get('/get-logged-user-role', UserRoleController.getLoggedUserRole, {
    beforeHandle: [
      checkUser(permission['GET_/api/user-roles/get-logged-user-role']),
    ],
    tags: ['UserRole'],
    detail: {
      summary: 'Get logged user role',
      description: "Retrieve the logged-in user's role with permissions",
      operationId: 'getLoggedUserRole',
    },
  })

  .put('/update', UserRoleController.updateRole, {
    beforeHandle: [checkUser(permission['PUT_/api/user-roles/update'])],
    query: t.Object({
      id: t.String({
        description: 'User role ID',
      }),
    }),
    body: UpdateUserRoleSchema,
    tags: ['UserRole'],
    detail: {
      summary: 'Update user role',
      description: 'Update an existing user role',
      operationId: 'updateUserRole',
    },
  })

  .delete('/delete', UserRoleController.deleteRole, {
    beforeHandle: [checkUser(permission['DELETE_/api/user-roles/delete'])],
    query: t.Object({
      id: t.String({
        description: 'User role ID',
      }),
    }),
    tags: ['UserRole'],
    detail: {
      summary: 'Delete user role',
      description:
        'Delete a user role (cannot delete system roles or roles with assigned users)',
      operationId: 'deleteUserRole',
    },
  });

export { permission };
export default userRoleRoute;
