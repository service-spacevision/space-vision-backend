import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const pins = pgTable('pins', {
  id: serial('id'),
  vessel_id: integer('vessel_id').notNull(),
  kitp: text('kitp').notNull(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  generated_by: integer('generated_by').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export type Pin = InferSelectModel<typeof pins>;
export type NewPin = InferInsertModel<typeof pins>;
