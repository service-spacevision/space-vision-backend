import { relations } from "drizzle-orm/relations";
import { vesselGroups, vessels, organizations } from "./schema";

export const vesselsRelations = relations(vessels, ({one}) => ({
	vesselGroup: one(vesselGroups, {
		fields: [vessels.groupId],
		references: [vesselGroups.id]
	}),
}));

export const vesselGroupsRelations = relations(vesselGroups, ({many}) => ({
	vessels: many(vessels),
}));

export const organizationsRelations = relations(organizations, ({one, many}) => ({
	organization: one(organizations, {
		fields: [organizations.parentOrgName],
		references: [organizations.name],
		relationName: "organizations_parentOrgName_organizations_name"
	}),
	organizations: many(organizations, {
		relationName: "organizations_parentOrgName_organizations_name"
	}),
}));