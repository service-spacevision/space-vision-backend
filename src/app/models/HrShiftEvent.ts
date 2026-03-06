import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { index, integer, jsonb, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core'

export const hrShiftEvents = pgTable(
  'hr_shift_events',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id').notNull(),
    shiftId: integer('shift_id').notNull(),
    employeeProfileId: integer('employee_profile_id').notNull(),
    actorUserId: integer('actor_user_id').notNull(),
    eventType: varchar('event_type', { length: 40 }).notNull(),
    eventAt: timestamp('event_at').notNull().defaultNow(),
    source: varchar('source', { length: 30 }).notNull().default('API'),
    payload: jsonb('payload'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    shiftEventIdx: index('hr_shift_events_shift_event_idx').on(table.shiftId, table.eventAt),
    employeeEventIdx: index('hr_shift_events_employee_event_idx').on(
      table.organizationId,
      table.employeeProfileId,
      table.eventAt,
    ),
  }),
)

export type HrShiftEvent = InferSelectModel<typeof hrShiftEvents>
export type NewHrShiftEvent = InferInsertModel<typeof hrShiftEvents>
