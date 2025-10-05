import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users } from './User';
import { vessels } from './Vessel';
import { mikrotikVessels } from './MikrotikVessel';

// Using string literal type for better type safety
export type PinType = 'mikrotik' | 'other';

export const pins = pgTable('pins', {
  id: serial('id').primaryKey(),
  type: text('type').$type<PinType>().notNull().default('other'),
  // For MikroTik pins
  vessel_id: integer('vessel_id').references(
    () => mikrotikVessels.id,
    { onDelete: 'set null', onUpdate: 'cascade' }
  ),
  vessel_name: text('vessel_name'),
  // For non-MikroTik pins
  kitp: text('kitp'),
  // Common fields
  username: text('username').notNull(),
  password: text('password').notNull(),
  generated_by: integer('generated_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export type Pin = Omit<InferSelectModel<typeof pins>, 'type'> & {
  type: PinType;
};

export type NewPin = Omit<InferInsertModel<typeof pins>, 'type'> & {
  type?: PinType;
};
