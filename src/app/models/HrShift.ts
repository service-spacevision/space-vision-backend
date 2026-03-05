import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { pgTable, serial, integer, varchar, text, timestamp, index } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

export const hrShifts = pgTable(
  'hr_shifts',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id').notNull(),
    employeeProfileId: integer('employee_profile_id').notNull(),
    shiftGroupId: integer('shift_group_id'),
    layoutId: integer('layout_id'),
    layoutRuleId: integer('layout_rule_id'),
    shiftStartAt: timestamp('shift_start_at').notNull(),
    shiftEndAt: timestamp('shift_end_at').notNull(),
    source: varchar('source', { length: 20 }).notNull().default('MANUAL'),
    status: varchar('status', { length: 20 }).notNull().default('SCHEDULED'),
    notes: text('notes'),
    createdByUserId: integer('created_by_user_id').notNull(),
    updatedByUserId: integer('updated_by_user_id'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    employeeStartIdx: index('hr_shifts_employee_start_idx').on(table.organizationId, table.employeeProfileId, table.shiftStartAt),
    groupStartIdx: index('hr_shifts_group_start_idx').on(table.organizationId, table.shiftGroupId, table.shiftStartAt),
  }),
)

export type HrShift = InferSelectModel<typeof hrShifts>
export type NewHrShift = InferInsertModel<typeof hrShifts>

export const CreateManualHrShiftSchema = t.Object({
  employeeProfileId: t.Number({ minimum: 1 }),
  shiftStartAt: t.String({ format: 'date-time' }),
  shiftEndAt: t.String({ format: 'date-time' }),
  notes: t.Optional(t.Nullable(t.String())),
})

export const UpdateHrShiftSchema = t.Object({
  shiftStartAt: t.Optional(t.String({ format: 'date-time' })),
  shiftEndAt: t.Optional(t.String({ format: 'date-time' })),
  status: t.Optional(t.String({ maxLength: 20 })),
  notes: t.Optional(t.Nullable(t.String())),
})

