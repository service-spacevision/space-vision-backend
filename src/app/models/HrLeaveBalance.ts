import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import {
  pgTable,
  serial,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'
import { t } from 'elysia'

export const hrLeaveBalances = pgTable('hr_leave_balances', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  employeeProfileId: integer('employee_profile_id').notNull(),
  leaveTypeId: integer('leave_type_id').notNull(),
  year: integer('year').notNull(),
  allocatedDays: integer('allocated_days').notNull().default(0),
  usedDays: integer('used_days').notNull().default(0),
  carriedOverDays: integer('carried_over_days').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  employeeTypeYearUnique: uniqueIndex('hr_leave_balances_emp_type_year_unique').on(
    table.organizationId,
    table.employeeProfileId,
    table.leaveTypeId,
    table.year,
  ),
  orgEmployeeIdx: index('hr_leave_balances_org_employee_idx').on(table.organizationId, table.employeeProfileId, table.year),
}))

export type HrLeaveBalance = InferSelectModel<typeof hrLeaveBalances>
export type NewHrLeaveBalance = InferInsertModel<typeof hrLeaveBalances>

export const UpsertHrLeaveBalanceSchema = t.Object({
  employeeProfileId: t.Number({ minimum: 1 }),
  leaveTypeId: t.Number({ minimum: 1 }),
  year: t.Number({ minimum: 2000 }),
  allocatedDays: t.Optional(t.Number({ minimum: 0 })),
  carriedOverDays: t.Optional(t.Number({ minimum: 0 })),
  usedDays: t.Optional(t.Number({ minimum: 0 })),
})
