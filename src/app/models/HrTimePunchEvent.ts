import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import {
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

export const hrTimePunchEvents = pgTable(
  'hr_time_punch_events',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id').notNull(),
    timeSessionId: integer('time_session_id').notNull(),
    employeeProfileId: integer('employee_profile_id').notNull(),
    userId: integer('user_id').notNull(),
    eventType: varchar('event_type', { length: 30 }).notNull(),
    eventAt: timestamp('event_at').notNull().defaultNow(),
    source: varchar('source', { length: 30 }).notNull().default('API'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    sessionIdx: index('hr_time_punch_events_session_idx').on(table.timeSessionId),
    employeeIdx: index('hr_time_punch_events_employee_idx').on(
      table.organizationId,
      table.employeeProfileId,
      table.eventAt,
    ),
  }),
)

export type HrTimePunchEvent = InferSelectModel<typeof hrTimePunchEvents>
export type NewHrTimePunchEvent = InferInsertModel<typeof hrTimePunchEvents>
