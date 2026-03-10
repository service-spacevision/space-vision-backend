// Central schema file - imports all models and defines relations
import { relations } from 'drizzle-orm';
import { users } from '../models/User';
import { sessions } from '../models/Session';
import { userRoles } from '../models/UserRole';
import { organizations } from '../models/Organization';
import { vessels } from '../models/Vessel';
import { vesselGroups } from '../models/VesselGroup';
import { groupAccess } from '../models/GroupAccess';
import { starlinkUsage } from '../models/StarlinkUsage';
import { bluetideUsage } from '../models/BluetideUsage';
import { bluetideTelemetry } from '../models/BluetideTelemetry';
import { mikrotikVessels } from '../models/MikrotikVessel';
import { mikrotikUsageSession } from '../models/MikrotikUsageSession';
import { mikrotikUsageAlltime } from '../models/MikrotikUsageAlltime';
// In src/app/db/schema.ts
import { mikrotikPermissions } from '../models/MikrotikPermission';
import { permissions, permissionScopeEnum } from '../models/Permission';
import { rolesPermission } from '../models/RolePermission';
import { telephonyDids } from '../models/TelephonyDid';
import { pins } from '../models/Pin';
import { syncState } from '../models/SyncState';

// Define relations here to avoid circular imports
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  role: one(userRoles, {
    fields: [users.roleId],
    references: [userRoles.id],
    relationName: 'user_role',
  }),
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
    relationName: 'user_organization',
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const userRolesRelations = relations(userRoles, ({ many, one }) => ({
  users: many(users, {
    relationName: 'user_role',
  }),
  organization: one(organizations, {
    fields: [userRoles.organizationName],
    references: [organizations.name],
    relationName: 'role_organization',
  }),
  permissions: one(rolesPermission, {
    fields: [userRoles.id],
    references: [rolesPermission.roleId],
    relationName: 'role_permission_role',
  }),
}));

export const organizationsRelations = relations(organizations, ({ one }) => ({
  parent: one(organizations, {
    fields: [organizations.parent_org_name],
    references: [organizations.name],
    relationName: 'organization_parent',
  }),
}));

export const rolesPermissionRelations = relations(
  rolesPermission,
  ({ one }) => ({
    role: one(userRoles, {
      fields: [rolesPermission.roleId],
      references: [userRoles.id],
      relationName: 'role_permission_role',
    }),
  }),
);

export const vesselGroupsRelations = relations(vesselGroups, ({ many }) => ({
  vessels: many(vessels, {
    relationName: 'vessel_group_vessel',
  }),
  groupAccess: many(groupAccess, {
    relationName: 'vessel_group_access',
  }),
}));

export const vesselsRelations = relations(vessels, ({ one, many }) => ({
  group: one(vesselGroups, {
    fields: [vessels.groupId],
    references: [vesselGroups.id],
    relationName: 'vessel_group_vessel',
  }),
  starlinkUsage: many(starlinkUsage, {
    relationName: 'vessel_starlink_usage',
  }),
  mikrotikVessel: one(mikrotikVessels, {
    fields: [vessels.name],
    references: [mikrotikVessels.vesselName],
    relationName: 'vessel_mikrotik',
  }),
}));

export const mikrotikVesselsRelations = relations(
  mikrotikVessels,
  ({ many, one }) => ({
    permissions: many(mikrotikPermissions, {
      relationName: 'mikrotik_vessel_permissions',
    }),
    vessel: one(vessels, {
      fields: [mikrotikVessels.vesselName],
      references: [vessels.name],
      relationName: 'vessel_mikrotik',
    }),
  }),
);

export const mikrotikPermissionsRelations = relations(
  mikrotikPermissions,
  ({ one }) => ({
    mikrotikVessel: one(mikrotikVessels, {
      fields: [mikrotikPermissions.vesselId],
      references: [mikrotikVessels.id],
      relationName: 'mikrotik_vessel_permissions',
    }),
    organization: one(organizations, {
      fields: [mikrotikPermissions.organizationId],
      references: [organizations.id],
      relationName: 'mikrotik_permission_organization',
    }),
    assignedBy: one(users, {
      fields: [mikrotikPermissions.assignedById],
      references: [users.id],
      relationName: 'mikrotik_permission_assigned_by',
    }),
  }),
);

export const groupAccessRelations = relations(groupAccess, ({ one }) => ({
  group: one(vesselGroups, {
    fields: [groupAccess.groupId],
    references: [vesselGroups.id],
    relationName: 'vessel_group_access',
  }),
}));

export const starlinkUsageRelations = relations(starlinkUsage, ({ one }) => ({
  vessel: one(vessels, {
    fields: [starlinkUsage.kitNumber],
    references: [vessels.vesselsKitNumber],
    relationName: 'vessel_starlink_usage',
  }),
}));

// No direct relation defined for telephonyDids as it doesn't have a vesselId field

export const pinsRelations = relations(pins, ({ one }) => ({
  vessel: one(mikrotikVessels, {
    fields: [pins.vessel_id],
    references: [mikrotikVessels.id],
    relationName: 'pin_vessel',
  }),
  generatedBy: one(users, {
    fields: [pins.generated_by],
    references: [users.id],
    relationName: 'pin_generated_by',
  }),
}));

// Re-export all models
export { users } from '../models/User';
export { sessions } from '../models/Session';
export { userRoles } from '../models/UserRole';
export { organizations } from '../models/Organization';
export { vessels } from '../models/Vessel';
export { vesselGroups } from '../models/VesselGroup';
export { groupAccess } from '../models/GroupAccess';
export { starlinkUsage } from '../models/StarlinkUsage';
export { bluetideUsage } from '../models/BluetideUsage';
export { bluetideTelemetry } from '../models/BluetideTelemetry';
export { mikrotikVessels } from '../models/MikrotikVessel';
export { mikrotikUsageSession } from '../models/MikrotikUsageSession';
export { mikrotikPermissions } from '../models/MikrotikPermission';
export { rolesPermission } from '../models/RolePermission';
export { telephonyDids } from '../models/TelephonyDid';
export { pins } from '../models/Pin';
export { permissions } from '../models/Permission';
export { syncState } from '../models/SyncState';
export { mikrotikUsageAlltime } from '../models/MikrotikUsageAlltime';

// Export enum values with type-safe names
export {
  permissionScopeEnum,
  permissionCategory as permissionCategoryEnum,
  permissionSection as permissionSectionEnum,
  permissionScope as permissionScopeValues,
} from '../models/Permission';
