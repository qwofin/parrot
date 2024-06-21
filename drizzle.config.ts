import type { Config } from 'drizzle-kit';

export default {
  schema: './app/db/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: 'config/db.sqlite'
  }
} satisfies Config;