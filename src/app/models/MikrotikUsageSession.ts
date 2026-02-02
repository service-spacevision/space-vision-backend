import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
  decimal,
} from "drizzle-orm/pg-core";
import { t } from "elysia";

// PostgreSQL model for mikrotik_usage_session following existing architecture
// Matches migration: migrations/0007_create_mikrotik_usage_tables.sql
export const mikrotikUsageSession = pgTable("mikrotik_usage_session", {
  id: serial("id").primaryKey(),
  vesselName: text("vessel_name").notNull(),
  vesselId: integer("vessel_id").notNull(),
  username: text("username").notNull(),
  ip: text("ip"),
  mac: text("mac"),
  uptime: text("uptime"),
  rxMb: integer("rx_mb").notNull().default(0),
  txMb: integer("tx_mb").notNull().default(0),
  totalAllowedMb: integer("total_allowed_mb").notNull().default(5000),
  percentageUsed: decimal("percentage_used", { precision: 5, scale: 1 })
    .notNull()
    .default("0.0"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export type MikrotikUsageSession = InferSelectModel<
  typeof mikrotikUsageSession
>;
export type NewMikrotikUsageSession = InferInsertModel<
  typeof mikrotikUsageSession
>;

// API Schemas
export const MikrotikUsageSessionResponse = t.Object({
  id: t.Number(),
  vesselName: t.String(),
  vesselId: t.Number(),
  username: t.String(),
  ip: t.Optional(t.String()),
  mac: t.Optional(t.String()),
  uptime: t.Optional(t.String()),
  rxMb: t.Number(),
  txMb: t.Number(),
  totalAllowedMb: t.Number(),
  percentageUsed: t.Number(),
  lastUpdated: t.Date(),
});
