import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { pgTable, serial, integer, varchar, boolean, timestamp, unique } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

export const hrShiftGroups = pgTable(
  'hr_shift_groups',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id').notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [unique('hr_shift_groups_org_name_unique').on(table.organizationId, table.name)],
)

export type HrShiftGroup = InferSelectModel<typeof hrShiftGroups>
export type NewHrShiftGroup = InferInsertModel<typeof hrShiftGroups>

export const CreateHrShiftGroupSchema = t.Object({
  organizationId: t.Optional(t.Number({ description: 'Organization ID (defaults to current user organization)' })),
  name: t.String({ minLength: 1, maxLength: 120 }),
  isActive: t.Optional(t.Boolean()),
})

export const UpdateHrShiftGroupSchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 120 })),
  isActive: t.Optional(t.Boolean()),
})

