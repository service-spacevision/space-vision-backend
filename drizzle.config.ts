import type { Config } from 'drizzle-kit'

export default {
  schema: './src/app/db/schema.ts',
  out: './src/app/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/elysia_db'
  }
} satisfies Config