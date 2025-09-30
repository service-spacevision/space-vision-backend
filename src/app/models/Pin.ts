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

export const pinTypeEnum = pgEnum('pin_type', ['mikrotik', 'other']);

export const pins = pgTable('pins', {
  id: serial('id').primaryKey(),
  type: pinTypeEnum('type').notNull().default('other'),
  // For MikroTik pins
  vessel_id: integer('vessel_id').references(
    () => mikrotikVessels.id
  ),
  vessel_name: text('vessel_name'),
  // For non-MikroTik pins
  kitp: text('kitp'),
  // Common fields
  username: text('username').notNull(),
  password: text('password').notNull(),
  generated_by: integer('generated_by')
    .notNull()
    .references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export type Pin = InferSelectModel<typeof pins>;
export type NewPin = InferInsertModel<typeof pins>;
