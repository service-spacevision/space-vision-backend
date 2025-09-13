import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { pgTable, serial, integer, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

// roles_permission table holds flattened permission strings as JSON in text columns
export const rolesPermission = pgTable('roles_permission', {
  id: serial('id').primaryKey(),
  roleId: integer('roleId').notNull(),
  api_permissions: text('api_permissions'),
  component_permissions: text('component_permissions'),
  navigation_permissions: text('navigation_permissions'),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
}, (table) => [
  unique('roles_permission_roleId_unique').on(table.roleId)
])

export type RolePermission = InferSelectModel<typeof rolesPermission>
export type NewRolePermission = InferInsertModel<typeof rolesPermission>

export type CreateRolePermissionData = {
  roleId: number
  api_permissions?: string[]
  component_permissions?: string[]
  navigation_permissions?: string[]
}

export type UpdateRolePermissionData = Partial<{
  api_permissions: string[]
  component_permissions: string[]
  navigation_permissions: string[]
}>

// Elysia schemas
export const CreateRolePermissionSchema = t.Object({
  roleId: t.Number(),
  api_permissions: t.Optional(t.Array(t.String())),
  component_permissions: t.Optional(t.Array(t.String())),
  navigation_permissions: t.Optional(t.Array(t.String()))
})

export const UpdateRolePermissionSchema = t.Object({
  api_permissions: t.Optional(t.Array(t.String())),
  component_permissions: t.Optional(t.Array(t.String())),
  navigation_permissions: t.Optional(t.Array(t.String()))
})

