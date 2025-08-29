import type { Config } from 'drizzle-kit'

export default {
  schema: './src/app/db/schema.ts',
  out: './src/app/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://root:example@localhost:5432/space_vision'
  }
} satisfies Config