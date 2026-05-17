/**
 * OWNER: P2 (Backend)
 * Apply migrations from db/migrations/ against the configured database.
 * Run with: `npm run db:migrate`
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from '@neondatabase/serverless';
import { getConnectionString } from '@netlify/database';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const url =
    process.env.NETLIFY_DB_URL ??
    process.env.NETLIFY_DATABASE_URL ??
    getConnectionString();
  if (!url) throw new Error('Database connection string is not set');

  const pool = new Pool({ connectionString: url });
  const dir = join(__dirname, 'migrations');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

  console.log(`Found ${files.length} migration(s).`);
  for (const file of files) {
    const sql = await readFile(join(dir, file), 'utf8');
    console.log(`Applying ${file}...`);
    await pool.query(sql);
  }
  await pool.end();
  console.log('Migrations applied.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
