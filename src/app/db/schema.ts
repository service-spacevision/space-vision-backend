// Central schema file - imports all models and defines relations
import { relations } from 'drizzle-orm'
import { users } from '../models/User'
import { sessions } from '../models/Session'

// Define relations here to avoid circular imports
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions)
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}))

// Export all tables
export { users, sessions }