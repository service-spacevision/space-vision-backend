import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

export const telephonyDids = pgTable('telephony_dids', {
  number: text('number').primaryKey(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  channelsIncludedCount: integer('channels_included_count'),
  dedicatedChannelsCount: integer('dedicated_channels_count'),
  blocked: boolean('blocked').default(false),
  terminated: boolean('terminated').default(false),
  updatedAt: timestamp('updated_at').defaultNow()
})

export type TelephonyDid = InferSelectModel<typeof telephonyDids>
export type NewTelephonyDid = InferInsertModel<typeof telephonyDids>

export const CreateTelephonyDidSchema = t.Object({
  number: t.String({
    description: 'Phone number (primary key)'
  }),
  description: t.Optional(t.String({
    description: 'Description'
  })),
  expiresAt: t.Optional(t.Date({
    description: 'Expiration date'
  })),
  channelsIncludedCount: t.Optional(t.Number({
    description: 'Number of included channels'
  })),
  dedicatedChannelsCount: t.Optional(t.Number({
    description: 'Number of dedicated channels'
  })),
  blocked: t.Optional(t.Boolean({
    description: 'Whether the number is blocked'
  })),
  terminated: t.Optional(t.Boolean({
    description: 'Whether the number is terminated'
  }))
})

export const UpdateTelephonyDidSchema = t.Object({
  description: t.Optional(t.String({
    description: 'Description'
  })),
  expiresAt: t.Optional(t.Date({
    description: 'Expiration date'
  })),
  channelsIncludedCount: t.Optional(t.Number({
    description: 'Number of included channels'
  })),
  dedicatedChannelsCount: t.Optional(t.Number({
    description: 'Number of dedicated channels'
  })),
  blocked: t.Optional(t.Boolean({
    description: 'Whether the number is blocked'
  })),
  terminated: t.Optional(t.Boolean({
    description: 'Whether the number is terminated'
  }))
})

export const TelephonyDidResponseSchema = t.Object({
  number: t.String(),
  description: t.Optional(t.String()),
  createdAt: t.Date(),
  expiresAt: t.Optional(t.Date()),
  channelsIncludedCount: t.Optional(t.Number()),
  dedicatedChannelsCount: t.Optional(t.Number()),
  blocked: t.Boolean(),
  terminated: t.Boolean(),
  updatedAt: t.Date()
})