import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { pgTable, serial, integer, timestamp, varchar, boolean } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

export const hrPolicyConfigs = pgTable('hr_policy_configs', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  policyName: varchar('policy_name', { length: 120 }).notNull().default('Default Policy'),
  isApplied: boolean('is_applied').notNull().default(false),
  appliedAt: timestamp('applied_at'),
  casualLeaveNoticeDays: integer('casual_leave_notice_days').notNull().default(14),
  maxConsecutiveLeaveDays: integer('max_consecutive_leave_days').notNull().default(3),
  probationDays: integer('probation_days').notNull().default(90),
  allowedBreakMinutes: integer('allowed_break_minutes').notNull().default(30),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type HrPolicyConfig = InferSelectModel<typeof hrPolicyConfigs>
export type NewHrPolicyConfig = InferInsertModel<typeof hrPolicyConfigs>

export const CreateHrPolicyConfigSchema = t.Object({
  organizationId: t.Optional(t.Number({ description: 'Organization ID (defaults to current user organization)' })),
  policyName: t.String({ minLength: 1, maxLength: 120 }),
  casualLeaveNoticeDays: t.Optional(t.Number({ minimum: 0 })),
  maxConsecutiveLeaveDays: t.Optional(t.Number({ minimum: 1 })),
  probationDays: t.Optional(t.Number({ minimum: 0 })),
  allowedBreakMinutes: t.Optional(t.Number({ minimum: 0 })),
})

export const ApplyHrPolicyConfigSchema = t.Object({
  policyId: t.Number({ minimum: 1, description: 'Policy row ID to apply' }),
  organizationId: t.Optional(t.Number({ description: 'Organization ID (defaults to current user organization)' })),
})

export const UpdateHrPolicyConfigSchema = t.Object({
  policyName: t.Optional(t.String({ minLength: 1, maxLength: 120 })),
  casualLeaveNoticeDays: t.Optional(t.Number({ minimum: 0 })),
  maxConsecutiveLeaveDays: t.Optional(t.Number({ minimum: 1 })),
  probationDays: t.Optional(t.Number({ minimum: 0 })),
  allowedBreakMinutes: t.Optional(t.Number({ minimum: 0 })),
})
