import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
  index,
} from 'drizzle-orm/pg-core'

export const hrTimeBreaks = pgTable('hr_time_breaks', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  timeSessionId: integer('time_session_id').notNull(),
  breakStartAt: timestamp('break_start_at').notNull(),
  breakEndAt: timestamp('break_end_at'),
  status: varchar('status', { length: 20 }).notNull().default('OPEN'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  sessionIdx: index('hr_time_breaks_session_idx').on(table.timeSessionId),
  orgSessionIdx: index('hr_time_breaks_org_session_idx').on(table.organizationId, table.timeSessionId),
}))

export type HrTimeBreak = InferSelectModel<typeof hrTimeBreaks>
export type NewHrTimeBreak = InferInsertModel<typeof hrTimeBreaks>
