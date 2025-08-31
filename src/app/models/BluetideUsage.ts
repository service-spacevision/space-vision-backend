import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { pgTable, text, real, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

export const bluetideUsage = pgTable('bluetide_usage', {
  date: text('date'),
  kitp: text('kitp'),
  name: text('name'),
  usageGb: real('usage_gb'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.date, table.kitp] })
  }
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
  date: t.String(),
  kitp: t.String(),
  name: t.Optional(t.String()),
  usageGb: t.Optional(t.Number()),
  createdAt: t.Date(),
  updatedAt: t.Date()
})