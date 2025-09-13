import { and, eq } from 'drizzle-orm'
import { db } from '../db/connection'
import { syncState } from '../models/SyncState'

export async function getSyncCursor(params: { source: string; partitionKey?: string }) {
  const { source, partitionKey = 'default' } = params
  const [row] = await db
    .select()
    .from(syncState)
    .where(and(eq(syncState.source, source), eq(syncState.partition_key, partitionKey)))
    .limit(1)

  return row ?? null
}

export async function upsertSyncCursor(params: {
  source: string
  partitionKey?: string
  cursorType?: string
  cursorValue?: string | null
  lastSyncedAt?: Date | null
  meta?: any
}) {
  const {
    source,
    partitionKey = 'default',
    cursorType = 'timestamp',
    cursorValue = null,
    lastSyncedAt = new Date(),
    meta = null,
  } = params

  await db
    .insert(syncState)
    .values({
      source,
      partition_key: partitionKey,
      cursor_type: cursorType,
      cursor_value: cursorValue ?? undefined,
      last_synced_at: lastSyncedAt ?? undefined,
      meta: meta ?? undefined,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .onConflictDoUpdate({
      target: [syncState.source, syncState.partition_key],
      set: {
        cursor_type: cursorType,
        cursor_value: cursorValue ?? undefined,
        last_synced_at: lastSyncedAt ?? undefined,
        meta: meta ?? undefined,
        updated_at: new Date(),
      },
    })
}

