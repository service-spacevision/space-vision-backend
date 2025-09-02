import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { pgTable, text, timestamp, serial, integer } from 'drizzle-orm/pg-core'
import { t } from 'elysia'
import { vesselGroups } from './VesselGroup'

export const groupAccess = pgTable('group_access', {
  id: serial('id').primaryKey(),
  role: text('role').notNull(),
  groupId: integer('group_id').notNull().references(() => vesselGroups.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export type GroupAccess = InferSelectModel<typeof groupAccess>
export type NewGroupAccess = InferInsertModel<typeof groupAccess>

export const CreateGroupAccessSchema = t.Object({
  role: t.String({
    description: 'Role name'
  }),
  groupId: t.Number({
    description: 'Vessel group ID (foreign key to vessel_groups.id)'
  })
})

export const UpdateGroupAccessSchema = t.Object({
  role: t.Optional(t.String({
    description: 'Role name'
  })),
  groupId: t.Optional(t.Number({
    description: 'Vessel group ID (foreign key to vessel_groups.id)'
  }))
})

export const GroupAccessResponseSchema = t.Object({
  id: t.Number(),
  role: t.String(),
  groupId: t.Number(),
  createdAt: t.Date(),
  updatedAt: t.Date()
})