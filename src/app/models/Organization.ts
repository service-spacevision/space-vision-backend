import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { t } from 'elysia'

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  logo: text("logo"),
  subscription_id: text("subscription_id"),
  parent_org_name: text("parent_org_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type Organization = InferSelectModel<typeof organizations>
export type NewOrganization = InferInsertModel<typeof organizations>

export const CreateOrganizationSchema = t.Object({
  name: t.String({ description: 'Organization unique name' }),
  description: t.Optional(t.String()),
  logo: t.Optional(t.String()),
  subscription_id: t.Optional(t.String()),
  parent_org_name: t.Optional(t.String({ description: 'Parent organization name' })),
})

export const UpdateOrganizationSchema = t.Object({
  description: t.Optional(t.String()),
  logo: t.Optional(t.String()),
  subscription_id: t.Optional(t.String()),
  parent_org_name: t.Optional(t.String({ description: 'Parent organization name' })),
})

export const OrganizationResponseSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  description: t.Optional(t.String()),
  logo: t.Optional(t.String()),
  subscription_id: t.Optional(t.String()),
  parent_org_name: t.Optional(t.String()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
})
