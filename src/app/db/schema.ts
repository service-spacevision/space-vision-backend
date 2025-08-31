// Central schema file - imports all models and defines relations
import { relations } from 'drizzle-orm'
import { users } from '../models/User'
import { sessions } from '../models/Session'
import { userRoles } from '../models/UserRole'

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

// Export all tables
export { users, sessions, userRoles }