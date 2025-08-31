import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

export const vesselGroups = pgTable('vessel_groups', {
  groupName: text('group_name').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export type VesselGroup = InferSelectModel<typeof vesselGroups>
export type NewVesselGroup = InferInsertModel<typeof vesselGroups>

export const CreateVesselGroupSchema = t.Object({
  groupName: t.String({
    description: 'Group name (primary key)'
  })
})

export const UpdateVesselGroupSchema = t.Object({
  groupName: t.String({
    description: 'Group name (primary key)'
  })
})

export const VesselGroupResponseSchema = t.Object({
  groupName: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date()
})