/**
 * OWNER: P4 (DevOps)
 * Cross-platform sync for Netlify background functions.
 *
 * Canonical sources live in netlify/background-functions. Netlify bundles from
 * netlify/functions, so this copies them before dev/build and rewrites the one
 * relative import that changes location after the copy.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'netlify', 'background-functions');
const dst = join(root, 'netlify', 'functions');

await mkdir(dst, { recursive: true });

const entries = await readdir(src);
const files = entries.filter((name) => /^background-.*\.ts$/.test(name)).sort();

for (const name of files) {
  const input = join(src, name);
  const functionName = name.replace(/^background-(.*)\.ts$/, '$1-background.ts');
  const output = join(dst, functionName);
  const source = await readFile(input, 'utf8');
  const rewritten = source
    .replaceAll("from '../functions/_lib/response'", "from './_lib/response'")
    .replaceAll("from '../functions/_lib/email'", "from './_lib/email'")
    .replaceAll('/.netlify/functions/background-embed-notes', '/.netlify/functions/embed-notes-background')
    .replaceAll(
      '/.netlify/functions/background-embed-transcript',
      '/.netlify/functions/embed-transcript-background',
    )
    .replaceAll(
      '/.netlify/functions/background-generate-feedback',
      '/.netlify/functions/generate-feedback-background',
    );
  await writeFile(output, rewritten, 'utf8');
  console.log(`synced ${name} -> ${functionName}`);
}

if (files.length === 0) {
  console.warn('No background functions found to sync.');
}
