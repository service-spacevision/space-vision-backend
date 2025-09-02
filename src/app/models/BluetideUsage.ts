import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { pgTable, text, real, timestamp, serial } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

export const bluetideUsage = pgTable('bluetide_usage', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  kitp: text('kitp').notNull(),
  name: text('name'),
  usageGb: real('usage_gb'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export type BluetideUsage = InferSelectModel<typeof bluetideUsage>
export type NewBluetideUsage = InferInsertModel<typeof bluetideUsage>

export const CreateBluetideUsageSchema = t.Object({
  date: t.String({
    description: 'Date'
  }),
  kitp: t.String({
    description: 'KITP'
  }),
  name: t.Optional(t.String({
    description: 'Name'
  })),
  usageGb: t.Optional(t.Number({
    description: 'Usage in GB'
  }))
})

export const UpdateBluetideUsageSchema = t.Object({
  name: t.Optional(t.String({
    description: 'Name'
  })),
  usageGb: t.Optional(t.Number({
    description: 'Usage in GB'
  }))
})

export const BluetideUsageResponseSchema = t.Object({
  id: t.Number(),
  date: t.String(),
  kitp: t.String(),
  name: t.Optional(t.String()),
  usageGb: t.Optional(t.Number()),
  createdAt: t.Date(),
  updatedAt: t.Date()
})