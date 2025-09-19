import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  serial,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { t } from "elysia";
import { vesselGroups } from "./VesselGroup";

export const groupAccess = pgTable("group_access", {
  id: serial("id").primaryKey(),
  role: integer("role").notNull(),
  groupId: integer("group_id").array().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  // updatedAt: timestamp('updated_at').defaultNow()
});

export type GroupAccess = InferSelectModel<typeof groupAccess>;
export type NewGroupAccess = InferInsertModel<typeof groupAccess>;

export const CreateGroupAccessSchema = t.Object({
  role: t.Number({
    description: "Role ID",
    minimum: 0,
  }),
  groupId: t.Array(t.Number(), {
    description: "Array of vessel group IDs",
    minItems: 1,
  }),
});

export const UpdateGroupAccessSchema = t.Object({
  role: t.Optional(
    t.Number({
      description: "Role ID",
      minimum: 0,
    })
  ),
  groupId: t.Optional(
    t.Array(t.Number(), {
      description: "Array of vessel group IDs",
      minItems: 1,
    })
  ),
});

export const GroupAccessResponseSchema = t.Object({
  id: t.Number(),
  role: t.Number(),
  groupId: t.Array(t.Number()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});
