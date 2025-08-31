import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

export const groupAccess = pgTable('group_access', {
  role: text('role'),
  groupName: text('group_name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.role, table.groupName] })
  }
})

export type GroupAccess = InferSelectModel<typeof groupAccess>
export type NewGroupAccess = InferInsertModel<typeof groupAccess>

export const CreateGroupAccessSchema = t.Object({
  role: t.String({
    description: 'Role name'
  }),
  groupName: t.String({
    description: 'Group name (foreign key)'
  })
})

export const UpdateGroupAccessSchema = t.Object({
  role: t.Optional(t.String({
    description: 'Role name'
  })),
  groupName: t.Optional(t.String({
    description: 'Group name (foreign key)'
  }))
})

export const GroupAccessResponseSchema = t.Object({
  role: t.String(),
  groupName: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date()
})