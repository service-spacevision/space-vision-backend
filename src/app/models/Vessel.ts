import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { t } from 'elysia';
import { vesselGroups } from './VesselGroup';

export const vessels = pgTable('vessels', {
  id: serial('id').primaryKey(),
  vesselsKitNumber: text('vesselskit_number').notNull().unique(),
  name: text('name'),
  subscriptionPlan: text('subscription_plan'),
  groupId: integer('group_id').references(() => vesselGroups.id),
  deviceId: text('device_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Vessel = InferSelectModel<typeof vessels>;
export type NewVessel = InferInsertModel<typeof vessels>;

export const CreateVesselSchema = t.Object({
  vesselsKitNumber: t.String({
    description: 'Vessel kit number (unique identifier)',
  }),
  name: t.Optional(
    t.String({
      description: 'Vessel name',
    })
  ),
  subscriptionPlan: t.Optional(
    t.String({
      description: 'Subscription plan',
    })
  ),
  groupId: t.Optional(
    t.Number({
      description: 'Group ID (foreign key to vessel_groups.id)',
    })
  ),
  isActive: t.Optional(
    t.Boolean({
      description: 'Is vessel active',
    })
  ),
  deviceId: t.Optional(
    t.String({
      description: 'Device ID',
    })
  ),
});

export const UpdateVesselSchema = t.Object({
  vesselsKitNumber: t.Optional(
    t.String({
      description: 'Vessel kit number (unique identifier)',
    })
  ),
  name: t.Optional(
    t.String({
      description: 'Vessel name',
    })
  ),
  subscriptionPlan: t.Optional(
    t.String({
      description: 'Subscription plan',
    })
  ),
  groupId: t.Optional(
    t.Number({
      description: 'Group ID (foreign key to vessel_groups.id)',
    })
  ),
  isActive: t.Optional(
    t.Boolean({
      description: 'Is vessel active',
    })
  ),
  deviceId: t.Optional(
    t.String({
      description: 'Device ID',
    })
  ),
});

export const VesselResponseSchema = t.Object({
  id: t.Number(),
  vesselsKitNumber: t.String(),
  name: t.Optional(t.String()),
  subscriptionPlan: t.Optional(t.String()),
  groupId: t.Optional(t.Number()),
  deviceId: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});
