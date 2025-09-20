import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { t } from "elysia";

// Use existing enum types with type safety
export const permissionScopeEnum = (name: string) =>
  sql`${sql.raw(name)}::permission_scope`;
export const permissionCategoryEnum = (name: string) =>
  sql`${sql.raw(name)}::permission_category`;
export const permissionSectionEnum = (name: string) =>
  sql`${sql.raw(name)}::permission_section`;

// Export the enum types for use in other files
export const permissionScope = ["own", "organization", "all"] as const;
export const permissionCategory = ["navigation", "component", "api"] as const;
export const permissionSection = ["admin", "organization"] as const;

// Define the enum values for type safety
export type PermissionScope = "own" | "organization" | "all";
export type PermissionCategory = "navigation" | "component" | "api";
export type PermissionSection = "admin" | "organization";
// permissions table
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  resource: varchar("resource", { length: 255 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  scope: varchar("scope").notNull().default("own"),
  section: varchar("section").notNull().default("organization"),
  category: varchar("category").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Permission = InferSelectModel<typeof permissions>;
export type NewPermission = InferInsertModel<typeof permissions>;

export type CreatePermissionData = Pick<
  NewPermission,
  | "name"
  | "resource"
  | "action"
  | "category"
  | "scope"
  | "description"
  | "section"
>;

export type UpdatePermissionData = Partial<
  Pick<
    Permission,
    "resource" | "action" | "category" | "scope" | "description" | "section"
  >
>;

// Elysia validation schemas
export const CreatePermissionSchema = t.Object({
  name: t.String({
    minLength: 1,
    maxLength: 255,
    description: "api_user_add | comp_vessels_dash",
  }),
  resource: t.String({ minLength: 1, maxLength: 255 }),
  action: t.String({ minLength: 1, maxLength: 100 }),
  scope: t.Optional(
    t.Union([t.Literal("own"), t.Literal("organization"), t.Literal("all")])
  ),
  category: t.Union([
    t.Literal("navigation"),
    t.Literal("component"),
    t.Literal("api"),
  ]),
  section: t.Optional(t.Union([t.Literal("admin"), t.Literal("organization")])),
  description: t.Optional(t.String()),
});

export const UpdatePermissionSchema = t.Object({
  resource: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  action: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  scope: t.Optional(
    t.Union([t.Literal("own"), t.Literal("organization"), t.Literal("all")])
  ),
  category: t.Optional(
    t.Union([t.Literal("navigation"), t.Literal("component"), t.Literal("api")])
  ),
  section: t.Optional(t.Union([t.Literal("admin"), t.Literal("organization")])),
  description: t.Optional(t.String()),
});

export const PermissionResponseSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  resource: t.String(),
  action: t.String(),
  scope: t.String(),
  section: t.String(),
  category: t.String(),
  description: t.Optional(t.String()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});
