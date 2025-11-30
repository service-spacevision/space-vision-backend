import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
  numeric,
} from 'drizzle-orm/pg-core';
import { t } from 'elysia';

export const mikrotikPermissions = pgTable('mikrotik_permissions', {
  id: serial('id').primaryKey(),
  vesselId: integer('vessel_id').notNull(),
  vesselName: text('vessel_name').notNull(),
  mikrotikUserName: text('mikrotik_user_name').notNull(),
  routerIp: text('router_ip').notNull(),
  routerPort: integer('router_port').notNull(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => organizations.id),
  username: text('username').notNull(),
  password: text('password').notNull(),
  assignedById: integer('assigned_by')
    .notNull()
    .references(() => users.id),
  type: text('type').notNull(),
  profile: text('profile'),
  server: text('server'),
  limitBytesTotal: numeric('limit_bytes_total'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type MikrotikPermission = InferSelectModel<typeof mikrotikPermissions>;
export type NewMikrotikPermission = InferInsertModel<
  typeof mikrotikPermissions
>;

export const CreateMikrotikPermissionSchema = t.Object({
  vesselId: t.Number({
    description: 'ID of the vessel',
  }),
  vesselName: t.String({
    description: 'Name of the Mikrotik vessel',
  }),
  mikrotikUserName: t.String({
    description: 'Mikrotik username for this permission',
  }),
  routerIp: t.String({
    description: 'Router IP address',
  }),
  routerPort: t.Number({
    description: 'Router port number',
  }),
  organizationId: t.Number({
    description: 'ID of the organization this permission belongs to',
  }),
  username: t.String({
    description: 'Username for authentication',
  }),
  password: t.String({
    description: 'Password for authentication',
  }),
  assignedById: t.Number({
    description: 'ID of the user who assigned this permission',
  }),
  type: t.String({
    description: 'Type of the permission',
  }),
  profile: t.Optional(t.String({ description: 'Profile for the permission' })),
  server: t.Optional(t.String({ description: 'Server for the permission' })),
  limitBytesTotal: t.Optional(
    t.Number({ description: 'Limit bytes total for the permission' })
  ),
});

export const UpdateMikrotikPermissionSchema = t.Object({
  vesselId: t.Optional(
    t.Number({
      description: 'ID of the Mikrotik vessel',
    })
  ),
  vesselName: t.Optional(
    t.String({
      description: 'Name of the Mikrotik vessel',
    })
  ),
  mikrotikUserName: t.Optional(
    t.String({
      description: 'Mikrotik username for this permission',
    })
  ),
  routerIp: t.Optional(
    t.String({
      description: 'Router IP address',
    })
  ),
  routerPort: t.Optional(
    t.Number({
      description: 'Router port number',
    })
  ),
  organizationId: t.Optional(
    t.Number({
      description: 'ID of the organization this permission belongs to',
    })
  ),
  username: t.Optional(
    t.String({
      description: 'Username for authentication',
    })
  ),
  password: t.Optional(
    t.String({
      description: 'Password for authentication',
    })
  ),
  assignedById: t.Optional(
    t.Number({
      description: 'ID of the user who assigned this permission',
    })
  ),
  type: t.Optional(
    t.String({
      description: 'Type of the permission',
    })
  ),
  profile: t.Optional(
    t.String({
      description: 'Profile for the permission',
    })
  ),
  server: t.Optional(
    t.String({
      description: 'Server for the permission',
    })
  ),
  limitBytesTotal: t.Optional(
    t.Number({
      description: 'Limit bytes total for the permission',
    })
  ),
});

export const MikrotikPermissionResponseSchema = t.Object({
  id: t.Number(),
  vesselId: t.Number(),
  vesselName: t.String(),
  mikrotikUserName: t.String(),
  routerIp: t.String(),
  routerPort: t.Number(),
  organizationId: t.Number(),
  username: t.String(),
  assignedById: t.Number(),
  type: t.String(),
  profile: t.Optional(t.String()),
  server: t.Optional(t.String()),
  limitBytesTotal: t.Optional(t.Number()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

// Import related models at the bottom to avoid circular dependencies
import { mikrotikVessels } from './MikrotikVessel';
import { organizations } from './Organization';
import { users } from './User';
