export const APP_CONFIG = {
  NAME: process.env.APP_NAME || 'ElysiaJS Backend',
  VERSION: '1.0.0',
  DESCRIPTION: 'ElysiaJS Backend API with PostgreSQL and Drizzle ORM',
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development'
}

export const DATABASE_CONFIG = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/elysia_db'
}

export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
}

export const SESSION_CONFIG = {
  SECRET: process.env.SESSION_SECRET || 'your-session-secret',
  EXPIRES_IN: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
}

export const authTypes = {
  local: 'local',
  oauth: 'oauth',
  ldap: 'ldap'
} as const

export const userRoles = {
  admin: 'admin',
  user: 'user',
  moderator: 'moderator'
} as const