import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { pgTable, varchar, timestamp, boolean, text, uuid, jsonb } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

// UserRoles table schema
export const userRoles = pgTable('user_roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 200 }),
  description: text('description'),
  permissions: jsonb('permissions').default([]),
  isActive: boolean('is_active').default(true),
  isSystem: boolean('is_system').default(false), // System roles cannot be deleted
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export type UserRole = InferSelectModel<typeof userRoles>
export type NewUserRole = InferInsertModel<typeof userRoles>

export type UserRoleWithoutSystem = Omit<UserRole, 'isSystem'>

export type CreateUserRoleData = Pick<NewUserRole,
  'name' | 'displayName' | 'description' | 'permissions'
>

export type UpdateUserRoleData = Partial<Pick<UserRole,
  'displayName' | 'description' | 'permissions' | 'isActive'
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
  permissions: t.Optional(t.Array(t.String(), {
    description: 'Array of permission strings'
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
  permissions: t.Optional(t.Array(t.String(), {
    description: 'Array of permission strings'
  })),
  isActive: t.Optional(t.Boolean({
    description: 'Role active status'
  }))
})

export const UserRoleResponseSchema = t.Object({
  id: t.String(),
  name: t.String(),
  displayName: t.Optional(t.String()),
  description: t.Optional(t.String()),
  permissions: t.Array(t.String()),
  isActive: t.Boolean(),
  isSystem: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date()
})

// UserRole relations are defined in schema.ts to avoid circular imports