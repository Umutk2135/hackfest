/**
 * OWNER: P2 (Backend)
 * POST /api/lectures/:id/start
 */
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { lectures } from '../../db/schema';
import {
  json,
  badRequest,
  notFound,
  getQueryParam,
  methodNotAllowed,
  handleOptions,
  error,
} from './_lib/response';
import type { StartSessionResponse } from '../../shared/types';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'POST') return methodNotAllowed();
  const id = getQueryParam(req, 'id');
  if (!id) return badRequest('id is required');

  const [existing] = await db().select().from(lectures).where(eq(lectures.id, id)).limit(1);
  if (!existing) return notFound('lecture not found');
  if (existing.status === 'ended') return error('invalid_state', 'lecture already ended', 409);

  const [row] = await db()
    .update(lectures)
    .set({ status: 'live', startedAt: new Date() })
    .where(eq(lectures.id, id))
    .returning();
  if (!row) return error('internal', 'update returned no row', 500);

  const body: StartSessionResponse = {
    sessionCode: row.sessionCode,
    startedAt: row.startedAt!.toISOString(),
    status: 'live',
  };
  return json(body);
}

export const config = { path: '/.netlify/functions/lecture-start' };
