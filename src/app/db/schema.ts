// Central schema file - imports all models and defines relations
import { relations } from 'drizzle-orm'
import { users } from '../models/User'
import { sessions } from '../models/Session'
import { userRoles } from '../models/UserRole'
import { vessels } from '../models/Vessel'
import { vesselGroups } from '../models/VesselGroup'
import { groupAccess } from '../models/GroupAccess'
import { starlinkUsage } from '../models/StarlinkUsage'
import { bluetideUsage } from '../models/BluetideUsage'
import { mikrotikVessels } from '../models/MikrotikVessel'
import { telephonyDids } from '../models/TelephonyDid'
import { pins } from '../models/Pin'

// Define relations here to avoid circular imports
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  role: one(userRoles, {
    fields: [users.roleId],
    references: [userRoles.id]
  })
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}))

export const userRolesRelations = relations(userRoles, ({ many }) => ({
  users: many(users)
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

// Export all tables
export { 
  users, 
  sessions, 
  userRoles, 
  vessels, 
  vesselGroups, 
  groupAccess, 
  starlinkUsage, 
  bluetideUsage, 
  mikrotikVessels, 
  telephonyDids, 
  pins 
}