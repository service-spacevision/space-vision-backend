import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { pgTable, varchar, timestamp, boolean, text, serial, integer, jsonb } from 'drizzle-orm/pg-core'

// Sessions table schema
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  token: text('token'),
  currentDB: varchar('current_db', { length: 100 }),
  sessionData: jsonb('session_data'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export type Session = InferSelectModel<typeof sessions>
export type NewSession = InferInsertModel<typeof sessions>

export type CreateSessionData = Pick<NewSession,
  'userId' | 'currentDB' | 'token' | 'sessionData' | 'ipAddress' | 'userAgent' | 'expiresAt'
>

export type SessionData = {
  loginTime: Date
  deviceInfo?: string
  location?: string
  role?: any
  [key: string]: any
}

// Session relations are defined in schema.ts to avoid circular imports