import { cookie } from '@elysiajs/cookie'
import { Elysia, t } from 'elysia'
import { HrTimeClockController } from '../../app/controllers/hrTimeClockControllers/hrTimeClockController'
import { checkUser } from '../../app/middlewares/permissions'

const permission = {
  'GET_/api/hr-time-clock/status': 'read_hr_time_clock_status',
  'GET_/api/hr-time-clock/my-audit': 'read_hr_time_clock_audit',
  'POST_/api/hr-time-clock/punch': 'punch_hr_time_clock',
  'POST_/api/hr-time-clock/punch-break': 'punch_hr_time_clock_break',
  'POST_/api/hr-time-clock/clock-in': 'clock_in_hr_time_clock',
  'POST_/api/hr-time-clock/start-break': 'start_break_hr_time_clock',
  'POST_/api/hr-time-clock/end-break': 'end_break_hr_time_clock',
  'POST_/api/hr-time-clock/clock-out': 'clock_out_hr_time_clock',
  'GET_/api/hr-time-clock/approvals/pending': 'read_hr_time_clock_pending_approvals',
  'POST_/api/hr-time-clock/approvals/:id/approve': 'approve_hr_time_clock_out',
  'POST_/api/hr-time-clock/approvals/:id/reject': 'reject_hr_time_clock_out',
  'GET_/api/hr-time-clock/approvals/breaks/pending':
    'read_hr_break_compliance_pending_approvals',
  'POST_/api/hr-time-clock/approvals/breaks/:id/approve':
    'approve_hr_break_compliance',
  'POST_/api/hr-time-clock/approvals/breaks/:id/reject':
    'reject_hr_break_compliance',
}

const hrTimeClockRoute = new Elysia({ prefix: '/api/hr-time-clock' })
  .use(cookie())
  .get('/status', HrTimeClockController.status, {
    beforeHandle: [checkUser(permission['GET_/api/hr-time-clock/status'])],
    tags: ['HR Time Clock'],
    detail: {
      summary: 'Get time clock status',
      description: 'Get current clock, break, and break-usage status for logged-in employee',
      operationId: 'getHrTimeClockStatus',
    },
  })
  .post('/punch', HrTimeClockController.punch, {
    beforeHandle: [checkUser(permission['POST_/api/hr-time-clock/punch'])],
    body: t.Optional(
      t.Object({
        endDay: t.Optional(
          t.Boolean({
            default: false,
            description: 'When true and user is clocked-in (not on break), this punch clocks out the day',
          }),
        ),
      }),
    ),
    tags: ['HR Time Clock'],
    detail: {
      summary: 'Work button punch',
      description: 'Two-button mode work action: toggles clock-in/clock-out only. If on break, end break first.',
      operationId: 'punchHrTimeClock',
    },
  })
  .post('/punch-break', HrTimeClockController.punchBreak, {
    beforeHandle: [checkUser(permission['POST_/api/hr-time-clock/punch-break'])],
    tags: ['HR Time Clock'],
    detail: {
      summary: 'Break button punch',
      description: 'Two-button mode break action: toggles break-out/break-in within active session',
      operationId: 'punchBreakHrTimeClock',
    },
  })
  .post('/clock-in', HrTimeClockController.clockIn, {
    beforeHandle: [checkUser(permission['POST_/api/hr-time-clock/clock-in'])],
    tags: ['HR Time Clock'],
    detail: {
      summary: 'Clock in',
      description: 'Start a working session',
      operationId: 'clockInHrTimeClock',
    },
  })
  .post('/start-break', HrTimeClockController.startBreak, {
    beforeHandle: [checkUser(permission['POST_/api/hr-time-clock/start-break'])],
    tags: ['HR Time Clock'],
    detail: {
      summary: 'Start break',
      description: 'Start a break within an active session',
      operationId: 'startBreakHrTimeClock',
    },
  })
  .post('/end-break', HrTimeClockController.endBreak, {
    beforeHandle: [checkUser(permission['POST_/api/hr-time-clock/end-break'])],
    tags: ['HR Time Clock'],
    detail: {
      summary: 'End break',
      description: 'End current break and calculate on-time/late flag using allowed break policy',
      operationId: 'endBreakHrTimeClock',
    },
  })
  .post('/clock-out', HrTimeClockController.clockOut, {
    beforeHandle: [checkUser(permission['POST_/api/hr-time-clock/clock-out'])],
    tags: ['HR Time Clock'],
    detail: {
      summary: 'Clock out',
      description: 'Close active session (requires no active break) and create pending approval',
      operationId: 'clockOutHrTimeClock',
    },
  })
  .get('/my-audit', HrTimeClockController.myAudit, {
    beforeHandle: [checkUser(permission['GET_/api/hr-time-clock/my-audit'])],
    query: t.Object({
      date: t.Optional(
        t.String({
          description: 'Optional date filter in YYYY-MM-DD',
        }),
      ),
    }),
    tags: ['HR Time Clock'],
    detail: {
      summary: 'Get my punch audit',
      description:
        'Fetch all time clock audit events (clock in/out and break in/out) for logged-in employee',
      operationId: 'getMyHrTimeClockAudit',
    },
  })
  .get('/approvals/pending', HrTimeClockController.pendingApprovals, {
    beforeHandle: [
      checkUser(permission['GET_/api/hr-time-clock/approvals/pending']),
    ],
    query: t.Object({
      userId: t.Optional(
        t.String({
          description: 'Optional employee user ID to filter pending approvals',
        }),
      ),
    }),
    tags: ['HR Time Clock'],
    detail: {
      summary: 'Get pending clock-out approvals',
      description:
        'List pending clock-out approvals assigned to current approver. Optional userId filters by employee user.',
      operationId: 'getPendingHrTimeClockApprovals',
    },
  })
  .post('/approvals/:id/approve', HrTimeClockController.approveClockOut, {
    beforeHandle: [
      checkUser(permission['POST_/api/hr-time-clock/approvals/:id/approve']),
    ],
    params: t.Object({
      id: t.String(),
    }),
    body: t.Optional(
      t.Object({
        adjustedClockOutAt: t.Optional(
          t.Nullable(
            t.String({
              format: 'date-time',
              description: 'Optional adjusted clock-out datetime',
            }),
          ),
        ),
        note: t.Optional(t.Nullable(t.String())),
      }),
    ),
    tags: ['HR Time Clock'],
    detail: {
      summary: 'Approve clock-out',
      description: 'Approve a pending clock-out request, optionally adjusting clock-out time',
      operationId: 'approveHrTimeClockOut',
    },
  })
  .post('/approvals/:id/reject', HrTimeClockController.rejectClockOut, {
    beforeHandle: [
      checkUser(permission['POST_/api/hr-time-clock/approvals/:id/reject']),
    ],
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      note: t.String({
        description: 'Rejection reason',
      }),
    }),
    tags: ['HR Time Clock'],
    detail: {
      summary: 'Reject clock-out',
      description: 'Reject a pending clock-out request with reason',
      operationId: 'rejectHrTimeClockOut',
    },
  })
  .get('/approvals/breaks/pending', HrTimeClockController.pendingBreakApprovals, {
    beforeHandle: [
      checkUser(permission['GET_/api/hr-time-clock/approvals/breaks/pending']),
    ],
    tags: ['HR Time Clock'],
    detail: {
      summary: 'Get pending break compliance approvals',
      description: 'List all pending late-break compliance approvals assigned to current approver',
      operationId: 'getPendingHrBreakComplianceApprovals',
    },
  })
  .post('/approvals/breaks/:id/approve', HrTimeClockController.approveBreakCompliance, {
    beforeHandle: [
      checkUser(permission['POST_/api/hr-time-clock/approvals/breaks/:id/approve']),
    ],
    params: t.Object({
      id: t.String(),
    }),
    body: t.Optional(
      t.Object({
        note: t.Optional(t.Nullable(t.String())),
      }),
    ),
    tags: ['HR Time Clock'],
    detail: {
      summary: 'Approve break compliance',
      description: 'Approve a pending late-break compliance request',
      operationId: 'approveHrBreakCompliance',
    },
  })
  .post('/approvals/breaks/:id/reject', HrTimeClockController.rejectBreakCompliance, {
    beforeHandle: [
      checkUser(permission['POST_/api/hr-time-clock/approvals/breaks/:id/reject']),
    ],
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      note: t.String({
        description: 'Rejection reason',
      }),
    }),
    tags: ['HR Time Clock'],
    detail: {
      summary: 'Reject break compliance',
      description: 'Reject a pending late-break compliance request',
      operationId: 'rejectHrBreakCompliance',
    },
  })

export { permission }
export default hrTimeClockRoute
