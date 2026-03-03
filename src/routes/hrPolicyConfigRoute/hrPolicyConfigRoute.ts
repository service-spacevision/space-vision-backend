import { cookie } from '@elysiajs/cookie'
import { Elysia, t } from 'elysia'
import { HrPolicyConfigController } from '../../app/controllers/hrPolicyConfigControllers/hrPolicyConfigController'
import { checkUser } from '../../app/middlewares/permissions'
import {
  AssignHrPolicyToEmployeesSchema,
  ApplyHrPolicyConfigSchema,
  CreateHrPolicyConfigSchema,
  UpdateHrPolicyConfigSchema,
} from '../../app/models/HrPolicyConfig'

const permission = {
  'POST_/api/hr-policies': 'create_hr_policy',
  'POST_/api/hr-policies/apply': 'apply_hr_policy',
  'POST_/api/hr-policies/assign-employees': 'assign_hr_policy_to_employees',
  'GET_/api/hr-policies': 'read_hr_policies',
  'GET_/api/hr-policies/current': 'read_hr_policy',
  'PUT_/api/hr-policies/update': 'update_hr_policy',
  'DELETE_/api/hr-policies/delete': 'delete_hr_policy',
}

const hrPolicyConfigRoute = new Elysia({ prefix: '/api/hr-policies' })
  .use(cookie())
  .get('/', HrPolicyConfigController.list, {
    beforeHandle: [checkUser(permission['GET_/api/hr-policies'])],
    query: t.Object({
      currentPage: t.Optional(t.String({ default: '1' })),
      pageSize: t.Optional(t.String({ default: '10' })),
      all: t.Optional(t.String({ default: 'false' })),
      search: t.Optional(t.String({ default: '' })),
      organizationId: t.Optional(
        t.String({
          description: 'Optional organization ID override (defaults to current user organization)',
        }),
      ),
    }),
    tags: ['HR Policy'],
    detail: {
      summary: 'List HR policies',
      description: 'List all policy templates under an organization',
      operationId: 'listHrPolicies',
    },
  })
  .post('/', HrPolicyConfigController.create, {
    beforeHandle: [checkUser(permission['POST_/api/hr-policies'])],
    body: CreateHrPolicyConfigSchema,
    tags: ['HR Policy'],
    detail: {
      summary: 'Create HR policy',
      description: 'Create HR policy config for an organization',
      operationId: 'createHrPolicy',
    },
  })
  .post('/apply', HrPolicyConfigController.apply, {
    beforeHandle: [checkUser(permission['POST_/api/hr-policies/apply'])],
    body: ApplyHrPolicyConfigSchema,
    tags: ['HR Policy'],
    detail: {
      summary: 'Apply HR policy',
      description: 'Apply an existing policy row to an organization by policyId',
      operationId: 'applyHrPolicy',
    },
  })
  .post('/assign-employees', HrPolicyConfigController.assignEmployees, {
    beforeHandle: [checkUser(permission['POST_/api/hr-policies/assign-employees'])],
    body: AssignHrPolicyToEmployeesSchema,
    tags: ['HR Policy'],
    detail: {
      summary: 'Assign policy to employees',
      description: 'Assign a selected policy to specific employee profiles and/or all employees of a role in your organization',
      operationId: 'assignHrPolicyToEmployees',
    },
  })
  .get('/current', HrPolicyConfigController.getCurrent, {
    beforeHandle: [checkUser(permission['GET_/api/hr-policies/current'])],
    query: t.Object({
      organizationId: t.Optional(
        t.String({
          description: 'Optional organization ID override (defaults to current user organization)',
        }),
      ),
    }),
    tags: ['HR Policy'],
    detail: {
      summary: 'Get current HR policy',
      description: 'Get HR policy config for an organization',
      operationId: 'getCurrentHrPolicy',
    },
  })
  .put('/update', HrPolicyConfigController.update, {
    beforeHandle: [checkUser(permission['PUT_/api/hr-policies/update'])],
    query: t.Object({
      id: t.String({
        description: 'HR policy ID',
      }),
    }),
    body: UpdateHrPolicyConfigSchema,
    tags: ['HR Policy'],
    detail: {
      summary: 'Update HR policy',
      description: 'Update an existing HR policy config',
      operationId: 'updateHrPolicy',
    },
  })
  .delete('/delete', HrPolicyConfigController.delete, {
    beforeHandle: [checkUser(permission['DELETE_/api/hr-policies/delete'])],
    query: t.Object({
      id: t.String({
        description: 'HR policy ID',
      }),
    }),
    tags: ['HR Policy'],
    detail: {
      summary: 'Delete HR policy',
      description: 'Delete an HR policy config',
      operationId: 'deleteHrPolicy',
    },
  })

export { permission }
export default hrPolicyConfigRoute
