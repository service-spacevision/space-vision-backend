import { InferInsertModel, InferSelectModel, sql } from 'drizzle-orm'
import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'

export const hrTimeSessions = pgTable('hr_time_sessions', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  employeeProfileId: integer('employee_profile_id').notNull(),
  clockInAt: timestamp('clock_in_at').notNull(),
  clockOutAt: timestamp('clock_out_at'),
  status: varchar('status', { length: 20 }).notNull().default('OPEN'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  singleOpenSessionPerEmployee: uniqueIndex('hr_time_sessions_single_open_per_employee')
    .on(table.organizationId, table.employeeProfileId)
    .where(sql`${table.clockOutAt} IS NULL`),
  orgEmployeeIdx: index('hr_time_sessions_org_employee_idx').on(table.organizationId, table.employeeProfileId),
}))

export type HrTimeSession = InferSelectModel<typeof hrTimeSessions>
export type NewHrTimeSession = InferInsertModel<typeof hrTimeSessions>
