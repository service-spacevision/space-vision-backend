import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { pgTable, serial, integer, varchar, timestamp, unique, boolean } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

const NullableDateTimeInput = t.Union([
  t.String({ format: 'date-time' }),
  t.Null(),
  t.Literal(''),
])

export const hrEmployeeProfiles = pgTable('hr_employee_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  organizationId: integer('organization_id').notNull(),
  employeeCode: varchar('employee_code', { length: 50 }),
  jobTitle: varchar('job_title', { length: 150 }),
  timezone: varchar('timezone', { length: 80 }),
  joinDate: timestamp('join_date'),
  isProbationApplicable: boolean('is_probation_applicable').default(false),
  probationStartAt: timestamp('probation_start_at'),
  probationEndAt: timestamp('probation_end_at'),
  leaveEligibilityStartAt: timestamp('leave_eligibility_start_at'),
  contractStartAt: timestamp('contract_start_at'),
  contractEndAt: timestamp('contract_end_at'),
  reportsToUserId: integer('reports_to_user_id'),
  hrStatus: varchar('hr_status', { length: 20 }).default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  unique('hr_employee_profiles_user_org_unique').on(table.userId, table.organizationId),
])

export type HrEmployeeProfile = InferSelectModel<typeof hrEmployeeProfiles>
export type NewHrEmployeeProfile = InferInsertModel<typeof hrEmployeeProfiles>

export const CreateHrEmployeeProfileSchema = t.Object({
  userId: t.Number({ description: 'Existing user ID to assign as employee' }),
  organizationId: t.Optional(t.Number({ description: 'Organization ID (defaults to current user organization)' })),
  employeeCode: t.Optional(t.String({ maxLength: 50 })),
  jobTitle: t.Optional(t.String({ maxLength: 150 })),
  timezone: t.Optional(t.String({ maxLength: 80 })),
  joinDate: t.Optional(NullableDateTimeInput),
  isProbationApplicable: t.Optional(t.Boolean()),
  probationStartAt: t.Optional(NullableDateTimeInput),
  probationEndAt: t.Optional(NullableDateTimeInput),
  leaveEligibilityStartAt: t.Optional(NullableDateTimeInput),
  contractStartAt: t.Optional(NullableDateTimeInput),
  contractEndAt: t.Optional(NullableDateTimeInput),
  reportsToUserId: t.Optional(t.Nullable(t.Number())),
  hrStatus: t.Optional(t.String({ maxLength: 20 })),
})

export const UpdateHrEmployeeProfileSchema = t.Object({
  employeeCode: t.Optional(t.String({ maxLength: 50 })),
  jobTitle: t.Optional(t.String({ maxLength: 150 })),
  timezone: t.Optional(t.String({ maxLength: 80 })),
  joinDate: t.Optional(NullableDateTimeInput),
  isProbationApplicable: t.Optional(t.Boolean()),
  probationStartAt: t.Optional(NullableDateTimeInput),
  probationEndAt: t.Optional(NullableDateTimeInput),
  leaveEligibilityStartAt: t.Optional(NullableDateTimeInput),
  contractStartAt: t.Optional(NullableDateTimeInput),
  contractEndAt: t.Optional(NullableDateTimeInput),
  reportsToUserId: t.Optional(t.Nullable(t.Number())),
  hrStatus: t.Optional(t.String({ maxLength: 20 })),
})

export const HrEmployeeProfileResponseSchema = t.Object({
  id: t.Number(),
  userId: t.Number(),
  organizationId: t.Number(),
  employeeCode: t.Optional(t.String()),
  jobTitle: t.Optional(t.String()),
  timezone: t.Optional(t.String()),
  joinDate: t.Optional(t.Nullable(t.Date())),
  isProbationApplicable: t.Optional(t.Nullable(t.Boolean())),
  probationStartAt: t.Optional(t.Nullable(t.Date())),
  probationEndAt: t.Optional(t.Nullable(t.Date())),
  leaveEligibilityStartAt: t.Optional(t.Nullable(t.Date())),
  contractStartAt: t.Optional(t.Nullable(t.Date())),
  contractEndAt: t.Optional(t.Nullable(t.Date())),
  reportsToUserId: t.Optional(t.Nullable(t.Number())),
  hrStatus: t.Optional(t.Nullable(t.String())),
  createdAt: t.Optional(t.Nullable(t.Date())),
  updatedAt: t.Optional(t.Nullable(t.Date())),
})
