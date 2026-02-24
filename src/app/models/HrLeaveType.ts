import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { pgTable, serial, integer, varchar, boolean, timestamp, unique } from 'drizzle-orm/pg-core'

export const hrLeaveTypes = pgTable('hr_leave_types', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  code: varchar('code', { length: 30 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  isEnabled: boolean('is_enabled').default(true),
  requiresNoticeDays: integer('requires_notice_days'),
  annualAllocationDays: integer('annual_allocation_days'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  unique('hr_leave_types_org_code_unique').on(table.organizationId, table.code),
])

export type HrLeaveType = InferSelectModel<typeof hrLeaveTypes>
export type NewHrLeaveType = InferInsertModel<typeof hrLeaveTypes>
