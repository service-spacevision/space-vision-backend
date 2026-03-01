import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { pgTable, serial, integer, timestamp, unique } from 'drizzle-orm/pg-core'

export const hrPolicyConfigs = pgTable('hr_policy_configs', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  casualLeaveNoticeDays: integer('casual_leave_notice_days').notNull().default(14),
  maxConsecutiveLeaveDays: integer('max_consecutive_leave_days').notNull().default(3),
  probationDays: integer('probation_days').notNull().default(90),
  allowedBreakMinutes: integer('allowed_break_minutes').notNull().default(30),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  unique('hr_policy_configs_org_unique').on(table.organizationId),
])

export type HrPolicyConfig = InferSelectModel<typeof hrPolicyConfigs>
export type NewHrPolicyConfig = InferInsertModel<typeof hrPolicyConfigs>
