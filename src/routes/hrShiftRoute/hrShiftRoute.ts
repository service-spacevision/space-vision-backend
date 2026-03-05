import { cookie } from '@elysiajs/cookie'
import { Elysia, t } from 'elysia'
import { HrShiftController } from '../../app/controllers/hrShiftControllers/hrShiftController'
import { checkUser } from '../../app/middlewares/permissions'
import { CreateManualHrShiftSchema, UpdateHrShiftSchema } from '../../app/models/HrShift'
import { AddShiftGroupMembersSchema } from '../../app/models/HrShiftGroupMember'
import { CreateHrShiftLayoutSchema, ApplyHrShiftLayoutSchema } from '../../app/models/HrShiftLayout'
import { CreateHrShiftGroupSchema } from '../../app/models/HrShiftGroup'

const permission = {
  'GET_/api/hr-shifts/timezones': 'read_hr_shift_timezones',
  'POST_/api/hr-shifts/groups': 'create_hr_shift_group',
  'POST_/api/hr-shifts/groups/members': 'update_hr_shift_group_members',
  'POST_/api/hr-shifts/layouts': 'create_hr_shift_layout',
  'POST_/api/hr-shifts/layouts/apply': 'apply_hr_shift_layout',
  'POST_/api/hr-shifts/manual': 'create_manual_hr_shift',
  'GET_/api/hr-shifts': 'read_hr_shifts',
  'PUT_/api/hr-shifts/update': 'update_hr_shift',
  'DELETE_/api/hr-shifts/delete': 'delete_hr_shift',
}

const hrShiftRoute = new Elysia({ prefix: '/api/hr-shifts' })
  .use(cookie())
  .get('/timezones', HrShiftController.listTimezones, {
    beforeHandle: [checkUser(permission['GET_/api/hr-shifts/timezones'])],
    tags: ['HR Shift'],
    detail: {
      summary: 'List IANA timezones',
      description: 'Return timezone list for frontend dropdown selection',
      operationId: 'getHrShiftTimezones',
    },
  })
  .post('/groups', HrShiftController.createGroup, {
    beforeHandle: [checkUser(permission['POST_/api/hr-shifts/groups'])],
    body: CreateHrShiftGroupSchema,
    tags: ['HR Shift'],
    detail: {
      summary: 'Create shift group',
      description: 'Create a shift group for assignment and layout scheduling',
      operationId: 'createHrShiftGroup',
    },
  })
  .post('/groups/members', HrShiftController.addGroupMembers, {
    beforeHandle: [checkUser(permission['POST_/api/hr-shifts/groups/members'])],
    body: AddShiftGroupMembersSchema,
    tags: ['HR Shift'],
    detail: {
      summary: 'Add shift group members',
      description: 'Assign employee profiles to shift group',
      operationId: 'addHrShiftGroupMembers',
    },
  })
  .post('/layouts', HrShiftController.createLayout, {
    beforeHandle: [checkUser(permission['POST_/api/hr-shifts/layouts'])],
    body: CreateHrShiftLayoutSchema,
    tags: ['HR Shift'],
    detail: {
      summary: 'Create shift layout',
      description: 'Create weekly auto-layout template for a shift group',
      operationId: 'createHrShiftLayout',
    },
  })
  .post('/layouts/apply', HrShiftController.applyLayout, {
    beforeHandle: [checkUser(permission['POST_/api/hr-shifts/layouts/apply'])],
    body: ApplyHrShiftLayoutSchema,
    tags: ['HR Shift'],
    detail: {
      summary: 'Apply shift layout',
      description: 'Generate shifts for group members from layout rules within date range',
      operationId: 'applyHrShiftLayout',
    },
  })
  .post('/manual', HrShiftController.createManual, {
    beforeHandle: [checkUser(permission['POST_/api/hr-shifts/manual'])],
    body: CreateManualHrShiftSchema,
    tags: ['HR Shift'],
    detail: {
      summary: 'Create manual shift',
      description: 'Manually create a shift for one employee profile',
      operationId: 'createManualHrShift',
    },
  })
  .get('/', HrShiftController.list, {
    beforeHandle: [checkUser(permission['GET_/api/hr-shifts'])],
    query: t.Object({
      currentPage: t.Optional(t.String({ default: '1' })),
      pageSize: t.Optional(t.String({ default: '10' })),
      all: t.Optional(t.String({ default: 'false' })),
      employeeProfileId: t.Optional(t.String()),
      shiftGroupId: t.Optional(t.String()),
      startDate: t.Optional(t.String({ format: 'date' })),
      endDate: t.Optional(t.String({ format: 'date' })),
    }),
    tags: ['HR Shift'],
    detail: {
      summary: 'List shifts',
      description: 'List manual and layout-generated shifts with filters and pagination',
      operationId: 'getHrShifts',
    },
  })
  .put('/update', HrShiftController.update, {
    beforeHandle: [checkUser(permission['PUT_/api/hr-shifts/update'])],
    query: t.Object({ id: t.String() }),
    body: UpdateHrShiftSchema,
    tags: ['HR Shift'],
    detail: {
      summary: 'Update shift',
      description: 'Update shift dates/status/notes',
      operationId: 'updateHrShift',
    },
  })
  .delete('/delete', HrShiftController.delete, {
    beforeHandle: [checkUser(permission['DELETE_/api/hr-shifts/delete'])],
    query: t.Object({ id: t.String() }),
    tags: ['HR Shift'],
    detail: {
      summary: 'Cancel shift',
      description: 'Soft delete by marking shift status as CANCELLED',
      operationId: 'deleteHrShift',
    },
  })

export { permission }
export default hrShiftRoute
