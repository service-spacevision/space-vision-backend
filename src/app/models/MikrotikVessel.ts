import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { pgTable, text, integer, timestamp, serial } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

export const mikrotikVessels = pgTable('mikrotik_vessels', {
  id: serial('id').primaryKey(),
  vesselName: text('vessel_name').notNull().unique(),
  routerIp: text('router_ip'),
  apiPort: integer('api_port'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export type MikrotikVessel = InferSelectModel<typeof mikrotikVessels>
export type NewMikrotikVessel = InferInsertModel<typeof mikrotikVessels>

export const CreateMikrotikVesselSchema = t.Object({
  vesselName: t.String({
    description: 'Vessel name (unique identifier)'
  }),
  routerIp: t.Optional(t.String({
    description: 'Router IP address'
  })),
  apiPort: t.Optional(t.Number({
    description: 'API port number'
  }))
})

export const UpdateMikrotikVesselSchema = t.Object({
  vesselName: t.Optional(t.String({
    description: 'Vessel name (unique identifier)'
  })),
  routerIp: t.Optional(t.String({
    description: 'Router IP address'
  })),
  apiPort: t.Optional(t.Number({
    description: 'API port number'
  }))
})

export const MikrotikVesselResponseSchema = t.Object({
  id: t.Number(),
  vesselName: t.String(),
  routerIp: t.Optional(t.String()),
  apiPort: t.Optional(t.Number()),
  createdAt: t.Date(),
  updatedAt: t.Date()
})