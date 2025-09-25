import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { t } from "elysia";

export const mikrotikUsageAlltime = pgTable(
  "mikrotik_usage_alltime",
  {
    id: serial("id").primaryKey(),
    vesselName: text("vessel_name").notNull(),
    vesselId: integer("vessel_id").notNull(),
    username: text("username").notNull(),
    uptime: text("uptime"),
    rxMb: integer("rx_mb").default(0).notNull(),
    txMb: integer("tx_mb").default(0).notNull(),
    totalAllowedMb: integer("total_allowed_mb").default(5000).notNull(),
    percentageUsed: numeric("percentage_used", { precision: 5, scale: 1 })
      .default("0.0")
      .notNull(),
    lastUpdated: timestamp("last_updated").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    unqVesselUsername: uniqueIndex("unq_vessel_username").on(
      table.vesselName,
      table.username
    ),
  })
);

export type MikrotikUsageAlltime = InferSelectModel<
  typeof mikrotikUsageAlltime
>;
export type NewMikrotikUsageAlltime = InferInsertModel<
  typeof mikrotikUsageAlltime
>;

export const MikrotikUsageAlltimeResponseSchema = t.Object({
  id: t.Number(),
  vesselName: t.String(),
  vesselId: t.Number(),
  username: t.String(),
  uptime: t.Optional(t.String()),
  rxMb: t.Number(),
  txMb: t.Number(),
  totalAllowedMb: t.Number(),
  percentageUsed: t.Union([t.Number(), t.String()]),
  lastUpdated: t.Optional(t.Union([t.Date(), t.String()])),
  createdAt: t.Optional(t.Union([t.Date(), t.String()])),
  updatedAt: t.Optional(t.Union([t.Date(), t.String()])),
});
