import { pgTable, uuid, varchar, jsonb, text, boolean, timestamp, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const sessions = pgTable("sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	currentDb: varchar("current_db", { length: 100 }),
	sessionData: jsonb("session_data"),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	isActive: boolean("is_active").default(true),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }),
	fullName: varchar("full_name", { length: 200 }),
	username: varchar({ length: 100 }),
	role: varchar({ length: 50 }).default('user'),
	isActive: boolean("is_active").default(true),
	isEmailVerified: boolean("is_email_verified").default(false),
	emailVerificationToken: varchar("email_verification_token", { length: 255 }),
	passwordResetToken: varchar("password_reset_token", { length: 255 }),
	passwordResetExpires: timestamp("password_reset_expires", { mode: 'string' }),
	mfaEnabled: boolean("mfa_enabled").default(false),
	mfaSecret: text("mfa_secret"),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	profilePicture: varchar("profile_picture", { length: 500 }),
	bio: text(),
	preferences: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_username_unique").on(table.username),
]);
