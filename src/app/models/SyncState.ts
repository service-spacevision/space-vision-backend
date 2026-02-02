import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { pgTable, serial, text, timestamp, jsonb, uniqueIndex } from 'drizzle-orm/pg-core'

export const syncState = pgTable('sync_state', {
  id: serial('id').primaryKey(),
  source: text('source').notNull(),
  partition_key: text('partition_key').notNull().default('default'),
  cursor_type: text('cursor_type').notNull().default('timestamp'),
  cursor_value: text('cursor_value'),
  last_synced_at: timestamp('last_synced_at', { withTimezone: true }),
  meta: jsonb('meta'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  source_partition_unique: uniqueIndex('sync_state_source_partition_unique').on(table.source, table.partition_key)
}))

export type SyncState = InferSelectModel<typeof syncState>
export type NewSyncState = InferInsertModel<typeof syncState>

