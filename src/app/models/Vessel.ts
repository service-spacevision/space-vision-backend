import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { t } from 'elysia'
import { vesselGroups } from './VesselGroup'

export const vessels = pgTable('vessels', {
  vesselsKitNumber: text('vesselskit_number').primaryKey(),
  name: text('name'),
  subscriptionPlan: text('subscription_plan'),
  groupId: integer('group_id').references(() => vesselGroups.groupId),
  deviceId: text('device_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export type Vessel = InferSelectModel<typeof vessels>
export type NewVessel = InferInsertModel<typeof vessels>

export const CreateVesselSchema = t.Object({
  vesselsKitNumber: t.String({
    description: 'Vessel kit number (primary key)'
  }),
  name: t.Optional(t.String({
    description: 'Vessel name'
  })),
  subscriptionPlan: t.Optional(t.String({
    description: 'Subscription plan'
  })),
  groupId: t.Optional(t.Number({
    description: 'Group ID (foreign key to vessel_groups.group_id)'
  })),
  deviceId: t.Optional(t.String({
    description: 'Device ID'
  }))
})

export const UpdateVesselSchema = t.Object({
  name: t.Optional(t.String({
    description: 'Vessel name'
  })),
  subscriptionPlan: t.Optional(t.String({
    description: 'Subscription plan'
  })),
  groupId: t.Optional(t.Number({
    description: 'Group ID (foreign key to vessel_groups.group_id)'
  })),
  deviceId: t.Optional(t.String({
    description: 'Device ID'
  }))
})

export const VesselResponseSchema = t.Object({
  vesselsKitNumber: t.String(),
  name: t.Optional(t.String()),
  subscriptionPlan: t.Optional(t.String()),
  groupId: t.Optional(t.Number()),
  deviceId: t.Optional(t.String()),
  createdAt: t.Date(),
  updatedAt: t.Date()
})