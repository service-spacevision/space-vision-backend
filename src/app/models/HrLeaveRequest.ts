import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  date,
  index,
} from 'drizzle-orm/pg-core'
import { t } from 'elysia'

export const hrLeaveRequests = pgTable('hr_leave_requests', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  employeeProfileId: integer('employee_profile_id').notNull(),
  leaveTypeId: integer('leave_type_id').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  requestedByUserId: integer('requested_by_user_id').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  orgEmployeeIdx: index('hr_leave_requests_org_employee_idx').on(table.organizationId, table.employeeProfileId, table.status),
  orgDateIdx: index('hr_leave_requests_org_date_idx').on(table.organizationId, table.startDate, table.endDate),
}))

export type HrLeaveRequest = InferSelectModel<typeof hrLeaveRequests>
export type NewHrLeaveRequest = InferInsertModel<typeof hrLeaveRequests>

export const CreateHrLeaveRequestSchema = t.Object({
  leaveTypeId: t.Number({ minimum: 1 }),
  startDate: t.String({ format: 'date' }),
  endDate: t.String({ format: 'date' }),
  reason: t.Optional(t.Nullable(t.String())),
})

export const LeaveApprovalDecisionSchema = t.Object({
  note: t.Optional(t.Nullable(t.String())),
})
