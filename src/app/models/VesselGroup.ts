import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { pgTable, text, timestamp, serial, boolean } from 'drizzle-orm/pg-core';
import { t } from 'elysia';

export const vesselGroups = pgTable('vessel_groups', {
  id: serial('id').primaryKey(),
  groupName: text('group_name').notNull().unique(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type VesselGroup = InferSelectModel<typeof vesselGroups>;
export type NewVesselGroup = InferInsertModel<typeof vesselGroups>;

export const CreateVesselGroupSchema = t.Object({
  groupName: t.String({
    description: 'Group name (unique)',
  }),
  isActive: t.Optional(
    t.Boolean({
      description: 'Is vessel group active',
    })
  ),
});

export const UpdateVesselGroupSchema = t.Object({
  groupName: t.Optional(
    t.String({
      description: 'Group name (unique)',
    })
  ),
  isActive: t.Optional(
    t.Boolean({
      description: 'Is vessel group active',
    })
  ),
});

export const VesselGroupResponseSchema = t.Object({
  id: t.Number(),
  groupName: t.String(),
  isActive: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});
