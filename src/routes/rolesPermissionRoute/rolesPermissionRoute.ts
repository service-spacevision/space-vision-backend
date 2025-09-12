import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { RolesPermissionController } from '../../app/controllers/rolesPermissionControllers/rolesPermissionController'
import { checkUser } from '../../app/middlewares/permissions'
import { CreateRolePermissionSchema, UpdateRolePermissionSchema } from '../../app/models/RolePermission'

const permission = {
  "POST_/api/roles-permissions": "create_roles_permission",
  "GET_/api/roles-permissions": "read_roles_permissions",
  "GET_/api/roles-permissions/by-id": "read_roles_permission",
  "PUT_/api/roles-permissions/update": "update_roles_permission",
  "DELETE_/api/roles-permissions/delete": "delete_roles_permission"
}

const rolesPermissionRoute = new Elysia({ prefix: '/api/roles-permissions' })
  .use(cookie())
  .post('/', RolesPermissionController.create, {
    beforeHandle: [checkUser(permission['POST_/api/roles-permissions'])],
    body: CreateRolePermissionSchema,
    tags: ['RolesPermission'],
    detail: {
      summary: 'Create roles_permission',
      description: 'Create flattened permissions for a role',
      operationId: 'createRolesPermission'
    }
  })
  .get('/', RolesPermissionController.list, {
    beforeHandle: [checkUser(permission['GET_/api/roles-permissions'])],
    query: t.Object({
      currentPage: t.Optional(t.String({ default: '1' })),
      pageSize: t.Optional(t.String({ default: '10' })),
      all: t.Optional(t.String({ default: 'false' }))
    }),
    tags: ['RolesPermission'],
    detail: {
      summary: 'List roles_permission',
      description: 'Retrieve role permission flatten records',
      operationId: 'getRolesPermissions'
    }
  })
  .get('/by-id', RolesPermissionController.getById, {
    beforeHandle: [checkUser(permission['GET_/api/roles-permissions/by-id'])],
    query: t.Object({ id: t.String() }),
    tags: ['RolesPermission'],
    detail: {
      summary: 'Get roles_permission by ID',
      description: 'Retrieve a roles_permission record by id',
      operationId: 'getRolesPermissionById'
    }
  })
  .put('/update', RolesPermissionController.update, {
    beforeHandle: [checkUser(permission['PUT_/api/roles-permissions/update'])],
    query: t.Object({ id: t.String() }),
    body: UpdateRolePermissionSchema,
    tags: ['RolesPermission'],
    detail: {
      summary: 'Update roles_permission',
      description: 'Update flattened permissions for a role',
      operationId: 'updateRolesPermission'
    }
  })
  .delete('/delete', RolesPermissionController.delete, {
    beforeHandle: [checkUser(permission['DELETE_/api/roles-permissions/delete'])],
    query: t.Object({ id: t.String() }),
    tags: ['RolesPermission'],
    detail: {
      summary: 'Delete roles_permission',
      description: 'Delete flattened permissions for a role',
      operationId: 'deleteRolesPermission'
    }
  })

export default rolesPermissionRoute

