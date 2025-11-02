import { InferSelectModel, InferInsertModel, sql } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  text,
  serial,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { t } from 'elysia';

// UserRoles table schema
export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 200 }),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  isSystem: boolean('is_system').default(false), // System roles cannot be deleted
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: varchar('created_by', { length: 100 }),
  organizationName: varchar('organization_name', { length: 100 }),
  permissions: jsonb('permissions').default([]),
  permittedVesselGroups: integer('permitted_vessel_groups')
    .array()
    .default(sql`ARRAY[]::integer[]`)
    .notNull(),
  permittedMikrotikVessels: integer('permitted_mikrotik_vessels')
    .array()
    .default(sql`ARRAY[]::integer[]`)
    .notNull(),
  organizationId: integer('organization_id'),
});

export type UserRole = InferSelectModel<typeof userRoles>;
export type NewUserRole = InferInsertModel<typeof userRoles>;

export type UserRoleWithoutSystem = Omit<UserRole, 'isSystem'>;

export type CreateUserRoleData = Pick<
  NewUserRole,
  | 'name'
  | 'displayName'
  | 'description'
  | 'permittedVesselGroups'
  | 'permittedMikrotikVessels'
  | 'organizationId'
>;

export type UpdateUserRoleData = Partial<
  Pick<
    UserRole,
    | 'displayName'
    | 'description'
    | 'isActive'
    | 'permittedVesselGroups'
    | 'permittedMikrotikVessels'
  >
>;

// Elysia schemas for request/response validation
export const CreateUserRoleSchema = t.Object({
  name: t.String({
    minLength: 1,
    maxLength: 100,
    description: 'Role name (unique identifier)',
  }),
  displayName: t.Optional(
    t.String({
      maxLength: 200,
      description: 'Human-readable role name',
    })
  ),
  description: t.Optional(
    t.String({
      maxLength: 1000,
      description: 'Role description',
    })
  ),
  permissions: t.Optional(
    t.Array(
      t.Number({
        description: 'Permission Ids',
      })
    )
  ),
  organizationId: t.Optional(
    t.Number({
      description: 'Organization ID',
    })
  ),
  permittedVesselGroups: t.Optional(
    t.Array(t.Number(), {
      description: 'Array of vessel group IDs that this role can access',
    })
  ),
});

export const UpdateUserRoleSchema = t.Object({
  displayName: t.Optional(
    t.String({
      maxLength: 200,
      description: 'Human-readable role name',
    })
  ),
  description: t.Optional(
    t.String({
      maxLength: 1000,
      description: 'Role description',
    })
  ),
  isActive: t.Optional(
    t.Boolean({
      description: 'Role active status',
    })
  ),
  permissions: t.Optional(
    t.Array(
      t.Number({
        description: 'Permission Ids',
      })
    )
  ),
  permittedVesselGroups: t.Optional(
    t.Array(t.Number(), {
      description: 'Array of vessel group IDs that this role can access',
    })
  ),
});

export const UserRoleResponseSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  displayName: t.Optional(t.String()),
  description: t.Optional(t.String()),
  organizationId: t.Optional(t.String()),
  permissions: t.Optional(t.Array(t.String())),
  isActive: t.Boolean(),
  isSystem: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  createdBy: t.Optional(t.String()),
  organizationName: t.Optional(t.String()),
  permittedVesselGroups: t.Array(t.Number()),
  permittedMikrotikVessels: t.Array(t.Number()),
});
