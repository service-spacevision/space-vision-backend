import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
  text,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'

export const hrTimeBreakApprovals = pgTable('hr_time_break_approvals', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  timeBreakId: integer('time_break_id').notNull(),
  requestedByUserId: integer('requested_by_user_id').notNull(),
  approverUserId: integer('approver_user_id').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  requestedAt: timestamp('requested_at').defaultNow(),
  decidedAt: timestamp('decided_at'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  timeBreakUnique: uniqueIndex('hr_time_break_approvals_time_break_unique').on(table.timeBreakId),
  approverIdx: index('hr_time_break_approvals_approver_idx').on(table.organizationId, table.approverUserId, table.status),
}))

export type HrTimeBreakApproval = InferSelectModel<typeof hrTimeBreakApprovals>
export type NewHrTimeBreakApproval = InferInsertModel<typeof hrTimeBreakApprovals>
