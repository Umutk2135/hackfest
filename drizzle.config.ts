import { defineConfig } from 'drizzle-kit';
import { getConnectionString } from '@netlify/database';

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NETLIFY_DATABASE_URL ?? getConnectionString(),
  },
  strict: true,
  verbose: true,
});
