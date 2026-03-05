import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { pgTable, serial, integer, varchar, boolean, unique } from 'drizzle-orm/pg-core'

export const hrShiftLayoutRules = pgTable(
  'hr_shift_layout_rules',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id').notNull(),
    layoutId: integer('layout_id').notNull(),
    dayOfWeek: integer('day_of_week').notNull(),
    startTime: varchar('start_time', { length: 5 }).notNull(),
    endTime: varchar('end_time', { length: 5 }).notNull(),
    isOffDay: boolean('is_off_day').notNull().default(false),
  },
  (table) => [unique('hr_shift_layout_rules_layout_day_unique').on(table.layoutId, table.dayOfWeek)],
)

export type HrShiftLayoutRule = InferSelectModel<typeof hrShiftLayoutRules>
export type NewHrShiftLayoutRule = InferInsertModel<typeof hrShiftLayoutRules>

