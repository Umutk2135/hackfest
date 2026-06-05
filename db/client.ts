/**
 * OWNER: P2 (Backend)
 * Drizzle client factory. Uses node-postgres to avoid WebSocket-specific runtime issues.
 * One module-level singleton per cold start. Lazy so this file is import-safe in tests.
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getConnectionString } from '@netlify/database';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function db() {
  if (_db) return _db;
  const url =
    process.env.NETLIFY_DB_URL ??
    process.env.NETLIFY_DATABASE_URL ??
    getConnectionString();
  if (!url) {
    throw new Error('Database connection string is not set');
  }
  const pool = new Pool({ connectionString: url });
  _db = drizzle(pool, { schema });
  return _db;
}

export { schema };
