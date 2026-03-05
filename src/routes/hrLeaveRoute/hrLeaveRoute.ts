import { cookie } from '@elysiajs/cookie'
import { Elysia, t } from 'elysia'
import { HrLeaveController } from '../../app/controllers/hrLeaveControllers/hrLeaveController'
import { checkUser } from '../../app/middlewares/permissions'
import { UpsertHrLeaveBalanceSchema } from '../../app/models/HrLeaveBalance'
import {
  CreateHrLeaveRequestSchema,
  LeaveApprovalDecisionSchema,
} from '../../app/models/HrLeaveRequest'
import { CreateHrLeaveTypeSchema, UpdateHrLeaveTypeSchema } from '../../app/models/HrLeaveType'

const permission = {
  'POST_/api/hr-leaves/types': 'create_hr_leave_type',
  'GET_/api/hr-leaves/types': 'read_hr_leave_types',
  'GET_/api/hr-leaves/types/by-id': 'read_hr_leave_type',
  'PUT_/api/hr-leaves/types/update': 'update_hr_leave_type',
  'DELETE_/api/hr-leaves/types/delete': 'delete_hr_leave_type',
  'POST_/api/hr-leaves/requests': 'create_hr_leave_request',
  'GET_/api/hr-leaves/requests/my': 'read_my_hr_leave_requests',
  'GET_/api/hr-leaves/approvals/pending': 'read_pending_hr_leave_approvals',
  'POST_/api/hr-leaves/approvals/:id/approve': 'approve_hr_leave_request',
  'POST_/api/hr-leaves/approvals/:id/reject': 'reject_hr_leave_request',
  'GET_/api/hr-leaves/balances/my': 'read_my_hr_leave_balances',
  'GET_/api/hr-leaves/balances/employee': 'read_employee_hr_leave_balances',
  'POST_/api/hr-leaves/balances/upsert': 'upsert_hr_leave_balance',
}

const hrLeaveRoute = new Elysia({ prefix: '/api/hr-leaves' })
  .use(cookie())
  .post('/types', HrLeaveController.createLeaveType, {
    beforeHandle: [checkUser(permission['POST_/api/hr-leaves/types'])],
    body: CreateHrLeaveTypeSchema,
    tags: ['HR Leave'],
    detail: {
      summary: 'Create leave type',
      description: 'Create a leave type for organization',
      operationId: 'createHrLeaveType',
    },
  })
  .get('/types', HrLeaveController.listLeaveTypes, {
    beforeHandle: [checkUser(permission['GET_/api/hr-leaves/types'])],
    query: t.Object({
      currentPage: t.Optional(t.String({ default: '1' })),
      pageSize: t.Optional(t.String({ default: '10' })),
      all: t.Optional(t.String({ default: 'false' })),
      search: t.Optional(t.String({ default: '' })),
      organizationId: t.Optional(t.String()),
    }),
    tags: ['HR Leave'],
    detail: {
      summary: 'List leave types',
      description: 'List leave types with pagination/search',
      operationId: 'listHrLeaveTypes',
    },
  })
  .get('/types/by-id', HrLeaveController.getLeaveTypeById, {
    beforeHandle: [checkUser(permission['GET_/api/hr-leaves/types/by-id'])],
    query: t.Object({ id: t.String() }),
    tags: ['HR Leave'],
    detail: {
      summary: 'Get leave type by id',
      description: 'Get a leave type by id',
      operationId: 'getHrLeaveTypeById',
    },
  })
  .put('/types/update', HrLeaveController.updateLeaveType, {
    beforeHandle: [checkUser(permission['PUT_/api/hr-leaves/types/update'])],
    query: t.Object({ id: t.String() }),
    body: UpdateHrLeaveTypeSchema,
    tags: ['HR Leave'],
    detail: {
      summary: 'Update leave type',
      description: 'Update leave type by id',
      operationId: 'updateHrLeaveType',
    },
  })
  .delete('/types/delete', HrLeaveController.deleteLeaveType, {
    beforeHandle: [checkUser(permission['DELETE_/api/hr-leaves/types/delete'])],
    query: t.Object({ id: t.String() }),
    tags: ['HR Leave'],
    detail: {
      summary: 'Delete leave type',
      description: 'Delete leave type by id',
      operationId: 'deleteHrLeaveType',
    },
  })
  .post('/requests', HrLeaveController.submitLeaveRequest, {
    beforeHandle: [checkUser(permission['POST_/api/hr-leaves/requests'])],
    body: CreateHrLeaveRequestSchema,
    tags: ['HR Leave'],
    detail: {
      summary: 'Submit leave request',
      description: 'Submit a leave request for logged-in employee',
      operationId: 'submitHrLeaveRequest',
    },
  })
  .get('/requests/my', HrLeaveController.myLeaveRequests, {
    beforeHandle: [checkUser(permission['GET_/api/hr-leaves/requests/my'])],
    query: t.Object({
      currentPage: t.Optional(t.String({ default: '1' })),
      pageSize: t.Optional(t.String({ default: '10' })),
      all: t.Optional(t.String({ default: 'false' })),
    }),
    tags: ['HR Leave'],
    detail: {
      summary: 'Get my leave requests',
      description: 'Get leave requests of logged-in employee',
      operationId: 'getMyHrLeaveRequests',
    },
  })
  .get('/approvals/pending', HrLeaveController.pendingApprovals, {
    beforeHandle: [checkUser(permission['GET_/api/hr-leaves/approvals/pending'])],
    query: t.Object({
      currentPage: t.Optional(t.String({ default: '1' })),
      pageSize: t.Optional(t.String({ default: '10' })),
      all: t.Optional(t.String({ default: 'false' })),
      userId: t.Optional(t.String()),
    }),
    tags: ['HR Leave'],
    detail: {
      summary: 'Get pending leave approvals',
      description: 'Get pending leave approvals assigned to logged-in approver',
      operationId: 'getPendingHrLeaveApprovals',
    },
  })
  .post('/approvals/:id/approve', HrLeaveController.approveLeaveRequest, {
    beforeHandle: [checkUser(permission['POST_/api/hr-leaves/approvals/:id/approve'])],
    params: t.Object({ id: t.String() }),
    body: t.Optional(LeaveApprovalDecisionSchema),
    tags: ['HR Leave'],
    detail: {
      summary: 'Approve leave request',
      description: 'Approve a pending leave request',
      operationId: 'approveHrLeaveRequest',
    },
  })
  .post('/approvals/:id/reject', HrLeaveController.rejectLeaveRequest, {
    beforeHandle: [checkUser(permission['POST_/api/hr-leaves/approvals/:id/reject'])],
    params: t.Object({ id: t.String() }),
    body: LeaveApprovalDecisionSchema,
    tags: ['HR Leave'],
    detail: {
      summary: 'Reject leave request',
      description: 'Reject a pending leave request',
      operationId: 'rejectHrLeaveRequest',
    },
  })
  .get('/balances/my', HrLeaveController.myBalances, {
    beforeHandle: [checkUser(permission['GET_/api/hr-leaves/balances/my'])],
    query: t.Object({
      year: t.Optional(t.String()),
    }),
    tags: ['HR Leave'],
    detail: {
      summary: 'Get my leave balances',
      description: 'Get leave balances for logged-in employee',
      operationId: 'getMyHrLeaveBalances',
    },
  })
  .get('/balances/employee', HrLeaveController.employeeBalances, {
    beforeHandle: [checkUser(permission['GET_/api/hr-leaves/balances/employee'])],
    query: t.Object({
      employeeProfileId: t.String(),
      year: t.Optional(t.String()),
    }),
    tags: ['HR Leave'],
    detail: {
      summary: 'Get employee leave balances',
      description: 'Get leave balances by employee profile id',
      operationId: 'getEmployeeHrLeaveBalances',
    },
  })
  .post('/balances/upsert', HrLeaveController.upsertBalance, {
    beforeHandle: [checkUser(permission['POST_/api/hr-leaves/balances/upsert'])],
    body: UpsertHrLeaveBalanceSchema,
    tags: ['HR Leave'],
    detail: {
      summary: 'Upsert leave balance',
      description: 'Create or update leave balance manually',
      operationId: 'upsertHrLeaveBalance',
    },
  })

export { permission }
export default hrLeaveRoute

