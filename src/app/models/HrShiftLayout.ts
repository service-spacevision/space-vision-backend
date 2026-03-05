import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { pgTable, serial, integer, varchar, boolean, timestamp, unique } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

export const hrShiftLayouts = pgTable(
  'hr_shift_layouts',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id').notNull(),
    shiftGroupId: integer('shift_group_id').notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    timezone: varchar('timezone', { length: 80 }).notNull().default('UTC'),
    isActive: boolean('is_active').notNull().default(true),
    createdByUserId: integer('created_by_user_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [unique('hr_shift_layouts_org_group_name_unique').on(table.organizationId, table.shiftGroupId, table.name)],
)

export type HrShiftLayout = InferSelectModel<typeof hrShiftLayouts>
export type NewHrShiftLayout = InferInsertModel<typeof hrShiftLayouts>

const ShiftLayoutRuleSchema = t.Object({
  dayOfWeek: t.Number({ minimum: 0, maximum: 6, description: '0=Sunday, 1=Monday ... 6=Saturday' }),
  startTime: t.String({ pattern: '^([01]\\d|2[0-3]):[0-5]\\d$', description: 'HH:mm (24-hour)' }),
  endTime: t.String({ pattern: '^([01]\\d|2[0-3]):[0-5]\\d$', description: 'HH:mm (24-hour)' }),
  isOffDay: t.Optional(t.Boolean()),
})

export const CreateHrShiftLayoutSchema = t.Object({
  organizationId: t.Optional(t.Number({ description: 'Organization ID (defaults to current user organization)' })),
  shiftGroupId: t.Number({ minimum: 1 }),
  name: t.String({ minLength: 1, maxLength: 120 }),
  timezone: t.Optional(t.String({ minLength: 1, maxLength: 80 })),
  rules: t.Array(ShiftLayoutRuleSchema, { minItems: 1, maxItems: 7 }),
})

export const ApplyHrShiftLayoutSchema = t.Object({
  layoutId: t.Number({ minimum: 1 }),
  startDate: t.String({ format: 'date' }),
  endDate: t.String({ format: 'date' }),
  overwriteExistingLayoutShifts: t.Optional(t.Boolean({ default: false })),
})

