import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { checkUser } from '../../app/middlewares/permissions'
import { HrEmployeeProfileController } from '../../app/controllers/hrEmployeeProfileControllers/hrEmployeeProfileController'
import {
  CreateHrEmployeeProfileSchema,
  UpdateHrEmployeeProfileSchema,
} from '../../app/models/HrEmployeeProfile'

const permission = {
  'POST_/api/hr-employee-profiles/assign': 'assign_hr_employee_profile',
  'GET_/api/hr-employee-profiles': 'read_hr_employee_profiles',
  'GET_/api/hr-employee-profiles/:id': 'read_hr_employee_profile',
  'PATCH_/api/hr-employee-profiles/:id': 'update_hr_employee_profile',
}

const hrEmployeeProfileRoute = new Elysia({ prefix: '/api/hr-employee-profiles' })
  .use(cookie())
  .post('/assign', HrEmployeeProfileController.assign, {
    beforeHandle: [checkUser(permission['POST_/api/hr-employee-profiles/assign'])],
    body: CreateHrEmployeeProfileSchema,
    tags: ['HR Employee Profile'],
    detail: {
      summary: 'Assign employee profile',
      description: 'Assign an existing user as an HR employee profile',
      operationId: 'assignHrEmployeeProfile',
    },
  })
  .get('/', HrEmployeeProfileController.list, {
    beforeHandle: [checkUser(permission['GET_/api/hr-employee-profiles'])],
    query: t.Object({
      currentPage: t.Optional(t.String({ default: '1' })),
      pageSize: t.Optional(t.String({ default: '10' })),
      all: t.Optional(t.String({ default: 'false' })),
      search: t.Optional(t.String({ default: '' })),
    }),
    tags: ['HR Employee Profile'],
    detail: {
      summary: 'Get employee profiles',
      description: 'List HR employee profiles under current organization',
      operationId: 'getHrEmployeeProfiles',
    },
  })
  .get('/:id', HrEmployeeProfileController.getById, {
    beforeHandle: [checkUser(permission['GET_/api/hr-employee-profiles/:id'])],
    params: t.Object({
      id: t.String(),
    }),
    tags: ['HR Employee Profile'],
    detail: {
      summary: 'Get employee profile by ID',
      description: 'Get a single HR employee profile under current organization',
      operationId: 'getHrEmployeeProfileById',
    },
  })
  .patch('/:id', HrEmployeeProfileController.update, {
    beforeHandle: [checkUser(permission['PATCH_/api/hr-employee-profiles/:id'])],
    params: t.Object({
      id: t.String(),
    }),
    body: UpdateHrEmployeeProfileSchema,
    tags: ['HR Employee Profile'],
    detail: {
      summary: 'Update employee profile',
      description: 'Update an HR employee profile under current organization',
      operationId: 'updateHrEmployeeProfile',
    },
  })

export { permission }
export default hrEmployeeProfileRoute
