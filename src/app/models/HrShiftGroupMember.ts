import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { pgTable, serial, integer, timestamp, unique } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

export const hrShiftGroupMembers = pgTable(
  'hr_shift_group_members',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id').notNull(),
    shiftGroupId: integer('shift_group_id').notNull(),
    employeeProfileId: integer('employee_profile_id').notNull(),
    addedAt: timestamp('added_at').defaultNow(),
  },
  (table) => [unique('hr_shift_group_members_unique').on(table.shiftGroupId, table.employeeProfileId)],
)

export type HrShiftGroupMember = InferSelectModel<typeof hrShiftGroupMembers>
export type NewHrShiftGroupMember = InferInsertModel<typeof hrShiftGroupMembers>

export const AddShiftGroupMembersSchema = t.Object({
  shiftGroupId: t.Number({ minimum: 1 }),
  employeeProfileIds: t.Array(t.Number({ minimum: 1 }), { minItems: 1 }),
})

