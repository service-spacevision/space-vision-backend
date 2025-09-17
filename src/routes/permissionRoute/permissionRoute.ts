import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { PermissionController } from '../../app/controllers/permissionControllers/permissionController'
import { checkUser } from '../../app/middlewares/permissions'
import { CreatePermissionSchema, UpdatePermissionSchema, PermissionResponseSchema } from '../../app/models/Permission'

const permission = {
  "POST_/api/permissions": "create_permission",
  "GET_/api/permissions": "read_permissions",
  "GET_/api/permissions/by-id": "read_permission",
  "PUT_/api/permissions/update": "update_permission",
  "DELETE_/api/permissions/delete": "delete_permission"
}

const permissionRoute = new Elysia({ prefix: '/api/permissions' })
  .use(cookie())
  .post('/', PermissionController.create, {
    beforeHandle: [checkUser(permission['POST_/api/permissions'])],
    body: CreatePermissionSchema,
    tags: ['Permissions'],
    detail: {
      summary: 'Create permission',
      description: 'Create a new permission',
      operationId: 'createPermission'
    }
  })
  .get('/', PermissionController.list, {
    beforeHandle: [checkUser(permission['GET_/api/permissions'])],
    query: t.Object({
      currentPage: t.Optional(t.String({ default: '1' })),
      pageSize: t.Optional(t.String({ default: '10' })),
      all: t.Optional(t.String({ default: 'false' }))
    }),
    tags: ['Permissions'],
    detail: {
      summary: 'List permissions',
      description: 'Retrieve permissions with pagination',
      operationId: 'getPermissions'
    }
  })
  .get('/by-id', PermissionController.getById, {
    beforeHandle: [checkUser(permission['GET_/api/permissions/by-id'])],
    query: t.Object({ id: t.String() }),
    response: { 200: PermissionResponseSchema },
    tags: ['Permissions'],
    detail: {
      summary: 'Get permission by ID',
      description: 'Retrieve a specific permission',
      operationId: 'getPermissionById'
    }
  })
  .put('/update', PermissionController.update, {
    beforeHandle: [checkUser(permission['PUT_/api/permissions/update'])],
    query: t.Object({ id: t.String() }),
    body: UpdatePermissionSchema,
    tags: ['Permissions'],
    detail: {
      summary: 'Update permission',
      description: 'Update an existing permission',
      operationId: 'updatePermission'
    }
  })
  .delete('/delete', PermissionController.delete, {
    beforeHandle: [checkUser(permission['DELETE_/api/permissions/delete'])],
    query: t.Object({ id: t.String() }),
    tags: ['Permissions'],
    detail: {
      summary: 'Delete permission',
      description: 'Delete a permission',
      operationId: 'deletePermission'
    }
  })

export { permission }
export default permissionRoute

