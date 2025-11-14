import { Elysia, t } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { OrganizationController } from '../../app/controllers/organizationControllers/organizationController';
import { checkUser } from '../../app/middlewares/permissions';
import {
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  OrganizationResponseSchema,
} from '../../app/models/Organization';

const permission = {
  'POST_/api/organizations': 'create_organization',
  'GET_/api/organizations': 'read_organizations',
  'GET_/api/organizations/by-name': 'read_organization',
  'PUT_/api/organizations/update': 'update_organization',
  'PUT_/api/organizations/admin/:id': 'admin_update_organization',
  'DELETE_/api/organizations/delete': 'delete_organization',
  'POST_/api/organizations/generate-org-access-token':
    'generate_org_access_token',
  'GET_/api/organizations/users/:id': 'get_organization_users',
};

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
      search: t.Optional(t.String()),
    }),
    tags: ['Organization'],
    detail: {
      summary: 'List organizations',
      description: 'Retrieve organizations with pagination',
      operationId: 'getOrganizations',
    },
  })
  .get(
    '/by-name',
    // @ts-ignore - Using any to bypass complex type issues
    async (ctx: any) => {
      const result = await OrganizationController.getByName(ctx);
      return result;
    },
    {
      beforeHandle: [
        checkUser(permission['GET_/api/organizations/by-name']) as any,
      ],
      query: t.Object({
        name: t.Optional(t.String()),
        id: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          message: t.String(),
          data: t.Union([OrganizationResponseSchema, t.Null()]),
        }),
        404: t.Object({
          success: t.Boolean(),
          message: t.String(),
          data: t.Null(),
        }),
      },
      tags: ['Organization'],
      detail: {
        summary: 'Get organization by name',
        description: 'Retrieve organization by unique name or ID',
        operationId: 'getOrganizationByName',
      },
    }
  )

  .put('/update', OrganizationController.update, {
    beforeHandle: [checkUser(permission['PUT_/api/organizations/update'])],
    query: t.Object({ name: t.String() }),
    body: UpdateOrganizationSchema,
    tags: ['Organization'],
    detail: {
      summary: 'Update organization',
      description:
        'Update an existing organization (restricted access to permittedVesselGroups)',
      operationId: 'updateOrganization',
    },
  })
  .put('/admin/:id', OrganizationController.updateByAdmin, {
    beforeHandle: [checkUser(permission['PUT_/api/organizations/admin/:id'])],
    params: t.Object({ id: t.String() }),
    body: UpdateOrganizationSchema,
    tags: ['Organization'],
    detail: {
      summary: 'Update organization by admin',
      description:
        'Admin route to update any organization by ID (full access to all fields)',
      operationId: 'updateOrganizationByAdmin',
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
  .get('/users/:id', OrganizationController.getUsers, {
    beforeHandle: [checkUser(permission['GET_/api/organizations/users/:id'])],
    params: t.Object({ id: t.String() }),
    tags: ['Organization'],
    detail: {
      summary: 'Get organization users',
      description: 'Retrieve users associated with an organization',
      operationId: 'getOrganizationUsers',
    },
  })
  .post(
    '/generate-org-access-token',
    OrganizationController.generateAccessToken,
    {
      beforeHandle: [
        checkUser(
          permission['POST_/api/organizations/generate-org-access-token']
        ),
      ],
      body: t.Object({
        userId: t.Number({ description: 'User ID that the token will act as' }),
        organizationId: t.Number({
          description: 'Organization ID to generate token for',
        }),
      }),
      tags: ['Organization'],
      detail: {
        summary: 'Generate organization access token',
        description:
          'Generate an encrypted access token for organization API access',
        operationId: 'generateOrganizationAccessToken',
      },
    }
  );

export { permission };
export default organizationRoute;
