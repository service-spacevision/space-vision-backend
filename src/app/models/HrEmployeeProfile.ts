import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { pgTable, serial, integer, varchar, timestamp, unique } from 'drizzle-orm/pg-core'

export const hrEmployeeProfiles = pgTable('hr_employee_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  organizationId: integer('organization_id').notNull(),
  employeeCode: varchar('employee_code', { length: 50 }),
  jobTitle: varchar('job_title', { length: 150 }),
  timezone: varchar('timezone', { length: 80 }),
  probationStartAt: timestamp('probation_start_at'),
  probationEndAt: timestamp('probation_end_at'),
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
