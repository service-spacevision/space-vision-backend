import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { pgTable, serial, varchar, text, pgEnum, timestamp } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

// Enum definitions
export const permissionScopeEnum = pgEnum('permission_scope', ['own', 'organization', 'all'])
export const permissionCategoryEnum = pgEnum('permission_category', ['navigation', 'component', 'api'])

// permissions table
export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  resource: varchar('resource', { length: 255 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  scope: permissionScopeEnum('scope').default('own'),
  category: permissionCategoryEnum('category').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type Permission = InferSelectModel<typeof permissions>
export type NewPermission = InferInsertModel<typeof permissions>

export type CreatePermissionData = Pick<NewPermission,
  'name' | 'resource' | 'action' | 'category' | 'scope' | 'description'
>

export type UpdatePermissionData = Partial<Pick<Permission,
  'resource' | 'action' | 'category' | 'scope' | 'description'
>>

// Elysia validation schemas
export const CreatePermissionSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  resource: t.String({ minLength: 1, maxLength: 255 }),
  action: t.String({ minLength: 1, maxLength: 100 }),
  scope: t.Optional(t.Union([
    t.Literal('own'),
    t.Literal('organization'),
    t.Literal('all')
  ])),
  category: t.Union([
    t.Literal('navigation'),
    t.Literal('component'),
    t.Literal('api')
  ]),
  description: t.Optional(t.String())
})

export const UpdatePermissionSchema = t.Object({
  resource: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  action: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  scope: t.Optional(t.Union([
    t.Literal('own'),
    t.Literal('organization'),
    t.Literal('all')
  ])),
  category: t.Optional(t.Union([
    t.Literal('navigation'),
    t.Literal('component'),
    t.Literal('api')
  ])),
  description: t.Optional(t.String())
})

export const PermissionResponseSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  resource: t.String(),
  action: t.String(),
  scope: t.String(),
  category: t.String(),
  description: t.Optional(t.String()),
  createdAt: t.Date(),
  updatedAt: t.Date()
})

