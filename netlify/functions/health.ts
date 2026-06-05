/**
 * OWNER: P2 (Backend)
 * GET /api/health — liveness check for CI and deploy smoke tests.
 */
import { json, handleOptions, methodNotAllowed } from './_lib/response';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'GET') return methodNotAllowed();
  return json({ ok: true, ts: new Date().toISOString() });
}

export const config = { path: '/.netlify/functions/health' };
