import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { pgTable, serial, integer, jsonb, timestamp, unique } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

// roles_permission table holds permission arrays as JSONB
export const rolesPermission = pgTable('roles_permission', {
  id: serial('id').primaryKey(),
  roleId: integer('roleId').notNull(),
  api_permissions: jsonb('api_permissions').$type<string[]>(),
  component_permissions: jsonb('component_permissions').$type<string[]>(),
  navigation_permissions: jsonb('navigation_permissions').$type<string[]>(),
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

