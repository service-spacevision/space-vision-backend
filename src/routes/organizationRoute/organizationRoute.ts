import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { OrganizationController } from '../../app/controllers/organizationControllers/organizationController'
import { checkUser } from '../../app/middlewares/permissions'
import { CreateOrganizationSchema, UpdateOrganizationSchema, OrganizationResponseSchema } from '../../app/models/Organization'

const permission = {
  "POST_/api/organizations": "create_organization",
  "GET_/api/organizations": "read_organizations",
  "GET_/api/organizations/by-name": "read_organization",
  "PUT_/api/organizations/update": "update_organization",
  "DELETE_/api/organizations/delete": "delete_organization",
}

const organizationRoute = new Elysia({ prefix: '/api/organizations' })
  .use(cookie())
  .post('/', OrganizationController.create, {
    beforeHandle: [checkUser(permission['POST_/api/organizations'])],
    body: CreateOrganizationSchema,
    tags: ['Organization'],
    detail: {
      summary: 'Create organization',
      description: 'Create a new organization',
      operationId: 'createOrganization',
    },
  })
  .get('/', OrganizationController.list, {
    beforeHandle: [checkUser(permission['GET_/api/organizations'])],
    query: t.Object({
      currentPage: t.Optional(t.String({ default: '1' })),
      pageSize: t.Optional(t.String({ default: '10' })),
      all: t.Optional(t.String({ default: 'false' })),
    }),
    tags: ['Organization'],
    detail: {
      summary: 'List organizations',
      description: 'Retrieve organizations with pagination',
      operationId: 'getOrganizations',
    },
  })
  .get('/by-name', OrganizationController.getByName, {
    beforeHandle: [checkUser(permission['GET_/api/organizations/by-name'])],
    query: t.Object({ name: t.String() }),
    response: { 200: OrganizationResponseSchema },
    tags: ['Organization'],
    detail: {
      summary: 'Get organization by name',
      description: 'Retrieve organization by unique name',
      operationId: 'getOrganizationByName',
    },
  })
  .put('/update', OrganizationController.update, {
    beforeHandle: [checkUser(permission['PUT_/api/organizations/update'])],
    query: t.Object({ name: t.String() }),
    body: UpdateOrganizationSchema,
    tags: ['Organization'],
    detail: {
      summary: 'Update organization',
      description: 'Update an existing organization',
      operationId: 'updateOrganization',
    },
  })
  .delete('/delete', OrganizationController.delete, {
    beforeHandle: [checkUser(permission['DELETE_/api/organizations/delete'])],
    query: t.Object({ name: t.String() }),
    tags: ['Organization'],
    detail: {
      summary: 'Delete organization',
      description: 'Delete an organization by name',
      operationId: 'deleteOrganization',
    },
  })

export default organizationRoute

