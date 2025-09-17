// Central schema file - imports all models and defines relations
import { relations } from 'drizzle-orm'
import { users } from '../models/User'
import { sessions } from '../models/Session'
import { userRoles } from '../models/UserRole'
import { organizations } from '../models/Organization'
import { vessels } from '../models/Vessel'
import { vesselGroups } from '../models/VesselGroup'
import { groupAccess } from '../models/GroupAccess'
import { starlinkUsage } from '../models/StarlinkUsage'
import { bluetideUsage } from '../models/BluetideUsage'
import { bluetideTelemetry } from '../models/BluetideTelemetry'
import { mikrotikVessels } from '../models/MikrotikVessel'
import { mikrotikUsageSession } from '../models/MikrotikUsageSession'
import { permissions, permissionScopeEnum, permissionCategoryEnum, permissionSectionEnum } from '../models/Permission'
import { rolesPermission } from '../models/RolePermission'
import { telephonyDids } from '../models/TelephonyDid'
import { pins } from '../models/Pin'
import { syncState } from '../models/SyncState'

// Define relations here to avoid circular imports
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  role: one(userRoles, {
    fields: [users.roleId],
    references: [userRoles.id]
  }),
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id]
  })
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}))

export const userRolesRelations = relations(userRoles, ({ many, one }) => ({
  users: many(users),
  organization: one(organizations, {
    fields: [userRoles.organizationId],
    references: [organizations.id]
  })
}))

export const organizationsRelations = relations(organizations, ({ one }) => ({
  parent: one(organizations, {
    fields: [organizations.parent_org_name],
    references: [organizations.name]
  })
}))

export const rolesPermissionRelations = relations(rolesPermission, ({ one }) => ({
  role: one(userRoles, {
    fields: [rolesPermission.roleId],
    references: [userRoles.id]
  })
}))

export const vesselGroupsRelations = relations(vesselGroups, ({ many }) => ({
  vessels: many(vessels),
  groupAccess: many(groupAccess)
}))

export const vesselsRelations = relations(vessels, ({ one, many }) => ({
  group: one(vesselGroups, {
    fields: [vessels.groupId],
    references: [vesselGroups.id]
  }),
  starlinkUsage: many(starlinkUsage),
  mikrotikVessel: one(mikrotikVessels, {
    fields: [vessels.name],
    references: [mikrotikVessels.vesselName]
  })
}))

export const groupAccessRelations = relations(groupAccess, ({ one }) => ({
  group: one(vesselGroups, {
    fields: [groupAccess.groupId],
    references: [vesselGroups.id]
  })
}))

export const starlinkUsageRelations = relations(starlinkUsage, ({ one }) => ({
  vessel: one(vessels, {
    fields: [starlinkUsage.kitNumber],
    references: [vessels.vesselsKitNumber]
  })
}))

export const mikrotikVesselsRelations = relations(mikrotikVessels, ({ one }) => ({
  vessel: one(vessels, {
    fields: [mikrotikVessels.vesselName],
    references: [vessels.name]
  })
}))

// No direct relation defined for telephonyDids as it doesn't have a vesselId field

export const pinsRelations = relations(pins, ({ one }) => ({
  vessel: one(vessels, {
    fields: [pins.vessel_id],
    references: [vessels.id]
  }),
  generatedBy: one(users, {
    fields: [pins.generated_by],
    references: [users.id]
  })
}))

// Export all tables and enums
export { 
  users, 
  sessions, 
  userRoles, 
  organizations,
  permissions,
  permissionScopeEnum,
  permissionCategoryEnum,
  permissionSectionEnum,
  rolesPermission,
  vessels, 
  vesselGroups, 
  groupAccess, 
  starlinkUsage, 
  bluetideUsage,
  bluetideTelemetry, 
  mikrotikVessels, 
  mikrotikUsageSession,
  telephonyDids, 
  pins,
  syncState
}
