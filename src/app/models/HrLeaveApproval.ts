import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'

export const hrLeaveApprovals = pgTable('hr_leave_approvals', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  leaveRequestId: integer('leave_request_id').notNull(),
  requestedByUserId: integer('requested_by_user_id').notNull(),
  approverUserId: integer('approver_user_id').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  requestedAt: timestamp('requested_at').defaultNow(),
  decidedAt: timestamp('decided_at'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  leaveRequestUnique: uniqueIndex('hr_leave_approvals_leave_request_unique').on(table.leaveRequestId),
  approverIdx: index('hr_leave_approvals_approver_idx').on(table.organizationId, table.approverUserId, table.status),
}))

export type HrLeaveApproval = InferSelectModel<typeof hrLeaveApprovals>
export type NewHrLeaveApproval = InferInsertModel<typeof hrLeaveApprovals>
