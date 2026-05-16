/**
 * OWNER: P2 (Backend)
 * Drizzle client factory. Uses Neon serverless driver — Netlify DB injects NETLIFY_DATABASE_URL.
 * One module-level singleton per cold start. Lazy so this file is import-safe in tests.
 */
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function db() {
  if (_db) return _db;
  const url = process.env.NETLIFY_DATABASE_URL;
  if (!url) {
    throw new Error('NETLIFY_DATABASE_URL is not set');
  }
  const pool = new Pool({ connectionString: url });
  _db = drizzle(pool, { schema });
  return _db;
}

export { schema };
