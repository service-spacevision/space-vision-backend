import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  pgTable,
  text,
  real,
  timestamp,
  serial,
  boolean,
} from "drizzle-orm/pg-core";
import { t } from "elysia";

export const starlinkUsage = pgTable("starlink_usage", {
  id: serial("id").primaryKey(),
  dateKey: text("date_key").notNull(),
  kitNumber: text("kit_number").notNull(),
  vesselName: text("vessel_name"),
  mobilePriorityGb: real("mobile_priority_gb"),
  standardGb: real("standard_gb"),
  chargebeeSubscriptionId: text("chargebee_subscription_id"),
  usageLimitGB: real("usage_limit_gb"),
  publicIP_Enabled: boolean("public_ip_enabled"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type StarlinkUsage = InferSelectModel<typeof starlinkUsage>;
export type NewStarlinkUsage = InferInsertModel<typeof starlinkUsage>;

export const CreateStarlinkUsageSchema = t.Object({
  dateKey: t.String({
    description: "Date key",
  }),
  kitNumber: t.String({
    description: "Kit number (foreign key)",
  }),
  vesselName: t.Optional(
    t.String({
      description: "Vessel name",
    })
  ),
  mobilePriorityGb: t.Optional(
    t.Number({
      description: "Mobile priority GB",
    })
  ),
  standardGb: t.Optional(
    t.Number({
      description: "Standard GB",
    })
  ),
  chargebeeSubscriptionId: t.Optional(
    t.String({
      description: "Chargebee subscription ID",
    })
  ),
  usageLimitGB: t.Optional(
    t.Number({
      description: "Usage Limit GB",
    })
  ),
  publicIP_Enabled: t.Optional(
    t.Boolean({
      description: "Is public IP enabled",
    })
  ),
});

export const UpdateStarlinkUsageSchema = t.Object({
  vesselName: t.Optional(
    t.String({
      description: "Vessel name",
    })
  ),
  mobilePriorityGb: t.Optional(
    t.Number({
      description: "Mobile priority GB",
    })
  ),
  standardGb: t.Optional(
    t.Number({
      description: "Standard GB",
    })
  ),
  chargebeeSubscriptionId: t.Optional(
    t.String({
      description: "Chargebee subscription ID",
    })
  ),
  usageLimitGB: t.Optional(
    t.Number({
      description: "Usage Limit GB",
    })
  ),
  publicIP_Enabled: t.Optional(
    t.Boolean({
      description: "Is public IP enabled",
    })
  ),
});

export const StarlinkUsageResponseSchema = t.Object({
  id: t.Number(),
  dateKey: t.String(),
  kitNumber: t.String(),
  vesselName: t.Optional(t.String()),
  mobilePriorityGb: t.Optional(t.Number()),
  standardGb: t.Optional(t.Number()),
  chargebeeSubscriptionId: t.Optional(t.String()),
  usageLimitGB: t.Optional(t.Number()),
  publicIP_Enabled: t.Optional(t.Boolean()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});
