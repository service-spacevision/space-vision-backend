import type { Config } from 'drizzle-kit'
import { readFileSync, existsSync } from 'fs'

// Lightweight .env loader (avoids adding dependencies)
(() => {
  const envPath = '.env'
  if (existsSync(envPath)) {
    try {
      const content = readFileSync(envPath, 'utf8')
      for (const line of content.split(/\r?\n/)) {
        if (!line || line.trim().startsWith('#')) continue
        const idx = line.indexOf('=')
        if (idx === -1) continue
        const key = line.slice(0, idx).trim()
        let val = line.slice(idx + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        if (!(key in process.env)) process.env[key] = val
      }
    } catch {
      // ignore
    }
  }
})()

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://root:example@localhost:5432/space_vision'

export default {
  schema: './src/app/db/schema.ts',
  out: './src/app/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL,
  },
} satisfies Config
