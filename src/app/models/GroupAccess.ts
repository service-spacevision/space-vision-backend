import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { pgTable, text, timestamp, primaryKey, integer } from 'drizzle-orm/pg-core'
import { t } from 'elysia'
import { vesselGroups } from './VesselGroup'

export const groupAccess = pgTable('group_access', {
  role: text('role'),
  groupId: integer('group_id').references(() => vesselGroups.groupId),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.role, table.groupId] })
  }
})

export type GroupAccess = InferSelectModel<typeof groupAccess>
export type NewGroupAccess = InferInsertModel<typeof groupAccess>

export const CreateGroupAccessSchema = t.Object({
  role: t.String({
    description: 'Role name'
  }),
  groupId: t.Number({
    description: 'Vessel group ID (foreign key to vessel_groups.group_id)'
  })
})

export const UpdateGroupAccessSchema = t.Object({
  role: t.Optional(t.String({
    description: 'Role name'
  })),
  groupId: t.Optional(t.Number({
    description: 'Vessel group ID (foreign key to vessel_groups.group_id)'
  }))
})

export const GroupAccessResponseSchema = t.Object({
  role: t.String(),
  groupId: t.Number(),
  createdAt: t.Date(),
  updatedAt: t.Date()
})