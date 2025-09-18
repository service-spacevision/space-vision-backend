import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { pgTable, varchar, timestamp, boolean, text, serial, jsonb } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

// UserRoles table schema
export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 200 }),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  isSystem: boolean('is_system').default(false), // System roles cannot be deleted
  created_by: varchar('created_by', { length: 100 }),
  organizationId: varchar('organization_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export type UserRole = InferSelectModel<typeof userRoles>
export type NewUserRole = InferInsertModel<typeof userRoles>

export type UserRoleWithoutSystem = Omit<UserRole, 'isSystem'>

export type CreateUserRoleData = Pick<NewUserRole,
  'name' | 'displayName' | 'description'
>

export type UpdateUserRoleData = Partial<Pick<UserRole,
  'displayName' | 'description' | 'isActive'
>>

// Elysia schemas for request/response validation
export const CreateUserRoleSchema = t.Object({
  name: t.String({
    minLength: 1,
    maxLength: 100,
    description: 'Role name (unique identifier)'
  }),
  displayName: t.Optional(t.String({
    maxLength: 200,
    description: 'Human-readable role name'
  })),
  description: t.Optional(t.String({
    maxLength: 1000,
    description: 'Role description'
  })),
  permissions: t.Optional(t.Array(t.String({
    description: 'Permission name'
  }))),
  organizationId: t.Optional(t.String({
    description: 'Organization ID'
  }))
})

export const UpdateUserRoleSchema = t.Object({
  displayName: t.Optional(t.String({
    maxLength: 200,
    description: 'Human-readable role name'
  })),
  description: t.Optional(t.String({
    maxLength: 1000,
    description: 'Role description'
  })),
  isActive: t.Optional(t.Boolean({
    description: 'Role active status'
  })),
  permissions: t.Optional(t.Array(t.String({
    description: 'Permission name'
  })))
})

export const UserRoleResponseSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  displayName: t.Optional(t.String()),
  description: t.Optional(t.String()),
  organizationId: t.Optional(t.String()),
  isActive: t.Boolean(),
  isSystem: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date()
})
