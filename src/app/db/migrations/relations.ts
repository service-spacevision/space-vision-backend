import { relations } from "drizzle-orm/relations";
import { vesselGroups, groupAccess, vessels } from "./schema";

export const groupAccessRelations = relations(groupAccess, ({one}) => ({
	vesselGroup: one(vesselGroups, {
		fields: [groupAccess.groupId],
		references: [vesselGroups.id]
	}),
}));

export const vesselGroupsRelations = relations(vesselGroups, ({many}) => ({
	groupAccesses: many(groupAccess),
	vessels: many(vessels),
}));

export const vesselsRelations = relations(vessels, ({one}) => ({
	vesselGroup: one(vesselGroups, {
		fields: [vessels.groupId],
		references: [vesselGroups.id]
	}),
}));