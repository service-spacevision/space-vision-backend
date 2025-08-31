import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { pgTable, text, real, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

export const starlinkUsage = pgTable('starlink_usage', {
  dateKey: text('date_key'),
  kitNumber: text('kit_number'),
  vesselName: text('vessel_name'),
  mobilePriorityGb: real('mobile_priority_gb'),
  standardGb: real('standard_gb'),
  chargebeeSubscriptionId: text('chargebee_subscription_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.dateKey, table.kitNumber] })
  }
})

export type StarlinkUsage = InferSelectModel<typeof starlinkUsage>
export type NewStarlinkUsage = InferInsertModel<typeof starlinkUsage>

export const CreateStarlinkUsageSchema = t.Object({
  dateKey: t.String({
    description: 'Date key'
  }),
  kitNumber: t.String({
    description: 'Kit number (foreign key)'
  }),
  vesselName: t.Optional(t.String({
    description: 'Vessel name'
  })),
  mobilePriorityGb: t.Optional(t.Number({
    description: 'Mobile priority GB'
  })),
  standardGb: t.Optional(t.Number({
    description: 'Standard GB'
  })),
  chargebeeSubscriptionId: t.Optional(t.String({
    description: 'Chargebee subscription ID'
  }))
})

export const UpdateStarlinkUsageSchema = t.Object({
  vesselName: t.Optional(t.String({
    description: 'Vessel name'
  })),
  mobilePriorityGb: t.Optional(t.Number({
    description: 'Mobile priority GB'
  })),
  standardGb: t.Optional(t.Number({
    description: 'Standard GB'
  })),
  chargebeeSubscriptionId: t.Optional(t.String({
    description: 'Chargebee subscription ID'
  }))
})

export const StarlinkUsageResponseSchema = t.Object({
  dateKey: t.String(),
  kitNumber: t.String(),
  vesselName: t.Optional(t.String()),
  mobilePriorityGb: t.Optional(t.Number()),
  standardGb: t.Optional(t.Number()),
  chargebeeSubscriptionId: t.Optional(t.String()),
  createdAt: t.Date(),
  updatedAt: t.Date()
})