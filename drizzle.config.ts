import type { Config } from 'drizzle-kit';

export default {
  schema: './src/app/db/schema.ts',
  out: './src/app/db/migrations',
  dialect: 'postgresql',
  verbose: true,

  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
  // dbCredentials: {
  //   url: 'postgresql://postgres:postgres@103.147.107.239:5432/space-vision',
  // },
} satisfies Config;
