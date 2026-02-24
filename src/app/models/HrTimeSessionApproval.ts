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

export const hrTimeSessionApprovals = pgTable('hr_time_session_approvals', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  timeSessionId: integer('time_session_id').notNull(),
  requestedByUserId: integer('requested_by_user_id').notNull(),
  approverUserId: integer('approver_user_id').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  requestedAt: timestamp('requested_at').defaultNow(),
  decidedAt: timestamp('decided_at'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  timeSessionUnique: uniqueIndex('hr_time_session_approvals_time_session_unique').on(table.timeSessionId),
  approverIdx: index('hr_time_session_approvals_approver_idx').on(table.organizationId, table.approverUserId, table.status),
}))

export type HrTimeSessionApproval = InferSelectModel<typeof hrTimeSessionApprovals>
export type NewHrTimeSessionApproval = InferInsertModel<typeof hrTimeSessionApprovals>
