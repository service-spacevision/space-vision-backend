import { cookie } from '@elysiajs/cookie'
import { Elysia, t } from 'elysia'
import { HrPolicyConfigController } from '../../app/controllers/hrPolicyConfigControllers/hrPolicyConfigController'
import { checkUser } from '../../app/middlewares/permissions'
import {
  ApplyHrPolicyConfigSchema,
  CreateHrPolicyConfigSchema,
  UpdateHrPolicyConfigSchema,
} from '../../app/models/HrPolicyConfig'

const permission = {
  'POST_/api/hr-policies': 'create_hr_policy',
  'POST_/api/hr-policies/apply': 'apply_hr_policy',
  'GET_/api/hr-policies/current': 'read_hr_policy',
  'PATCH_/api/hr-policies/:id': 'update_hr_policy',
  'DELETE_/api/hr-policies/:id': 'delete_hr_policy',
}

const hrPolicyConfigRoute = new Elysia({ prefix: '/api/hr-policies' })
  .use(cookie())
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
  .patch('/:id', HrPolicyConfigController.update, {
    beforeHandle: [checkUser(permission['PATCH_/api/hr-policies/:id'])],
    params: t.Object({
      id: t.String(),
    }),
    body: UpdateHrPolicyConfigSchema,
    tags: ['HR Policy'],
    detail: {
      summary: 'Update HR policy',
      description: 'Update an existing HR policy config',
      operationId: 'updateHrPolicy',
    },
  })
  .delete('/:id', HrPolicyConfigController.delete, {
    beforeHandle: [checkUser(permission['DELETE_/api/hr-policies/:id'])],
    params: t.Object({
      id: t.String(),
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
