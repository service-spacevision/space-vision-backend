import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { pgTable, varchar, timestamp, boolean, text, serial, integer, jsonb } from 'drizzle-orm/pg-core'

import { t } from 'elysia'

// Users table schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  fullName: varchar('full_name', { length: 200 }),
  username: varchar('username', { length: 100 }).unique(),
  roleId: integer('role_id'),
  isActive: boolean('is_active').default(true),
  isEmailVerified: boolean('is_email_verified').default(false),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires'),
  mfaEnabled: boolean('mfa_enabled').default(false),
  mfaSecret: text('mfa_secret'),
  lastLoginAt: timestamp('last_login_at'),
  profilePicture: varchar('profile_picture', { length: 500 }),
  bio: text('bio'),
  preferences: jsonb('preferences'),
  organizationId: integer('organization_id'),
  createdBy: varchar('created_by', { length: 100 }),
  updatedBy: varchar('updated_by', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>

export type UserWithoutPassword = Omit<User, 'password' | 'mfaSecret' | 'emailVerificationToken' | 'passwordResetToken'>

export type UserProfile = Pick<User,
  'id' | 'email' | 'fullName' | 'username' | 'roleId' | 'isActive' |
  'isEmailVerified' | 'mfaEnabled' | 'lastLoginAt' | 'profilePicture' |
  'bio' | 'preferences' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>

export type CreateUserData = Pick<NewUser,
  'email' | 'password' | 'fullName' | 'username' | 'roleId' | 'organizationId' | 'createdBy' | 'updatedBy'
>

export type UpdateUserData = Partial<Pick<User,
  'fullName' | 'username' | 'isActive' | 'roleId' | 'profilePicture' | 'bio' | 'preferences' | 'createdBy' | 'organizationId' | 'updatedBy'
>>

// Elysia schemas for request/response validation
export const SignUpSchema = t.Object({
  email: t.String({
    format: 'email',
    description: 'User email address'
  }),
  password: t.Optional(t.String({
    minLength: 8,
    description: 'User password (minimum 8 characters)'
  })),
  fullName: t.Optional(t.String({
    maxLength: 200,
    description: 'User full name'
  })),
  username: t.Optional(t.String({
    maxLength: 100,
    description: 'Unique username'
  })),
  roleId: t.Optional(t.Number({
    description: 'User role ID'
  })),
  organizationId: t.Optional(t.Number({
    description: 'User organization ID'
  })),
})

export const SignInSchema = t.Object({
  email: t.String({
    format: 'email',
    description: 'User email address'
  }),
  password: t.String({
    description: 'User password'
  })
})

export const UpdateProfileSchema = t.Object({
  fullName: t.Optional(t.String({
    maxLength: 200,
    description: 'User full name'
  })),
  username: t.Optional(t.String({
    maxLength: 100,
    description: 'Unique username'
  })),
  profilePicture: t.Optional(t.String({
    maxLength: 500,
    description: 'Profile picture URL'
  })),
  bio: t.Optional(t.String({
    maxLength: 1000,
    description: 'User bio'
  })),
  preferences: t.Optional(t.Object({}, {
    description: 'User preferences as JSON object'
  })),
  // Admin-only fields
  isActive: t.Optional(t.Boolean({
    description: 'User active status (admin only)'
  })),
  roleId: t.Optional(t.Number({
    description: 'User role ID (admin only)'
  })),
})

export const ChangePasswordSchema = t.Object({
  currentPassword: t.String({
    description: 'Current password'
  }),
  newPassword: t.String({
    minLength: 8,
    description: 'New password (minimum 8 characters)'
  })
})

export const DeleteAccountSchema = t.Object({
  password: t.String({
    description: 'Current password for confirmation'
  })
})

export const UserResponseSchema = t.Object({
  id: t.Number(),
  email: t.String(),
  fullName: t.Optional(t.String()),
  username: t.Optional(t.String()),
  roleId: t.Optional(t.Number()),
  isActive: t.Boolean(),
  isEmailVerified: t.Boolean(),
  mfaEnabled: t.Boolean(),
  lastLoginAt: t.Optional(t.Date()),
  profilePicture: t.Optional(t.String()),
  bio: t.Optional(t.String()),
  preferences: t.Optional(t.Object({})),
  organizationId: t.Optional(t.Number()),
  createdBy: t.Optional(t.Any()),
  updatedBy: t.Optional(t.Any()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
})

// User relations are defined in schema.ts to avoid circular imports