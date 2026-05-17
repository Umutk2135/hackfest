/**
 * OWNER: P2 (Backend)
 * POST /api/lectures/:id/end
 * Ends the live session and triggers background feedback generation.
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
import type { EndSessionResponse } from '../../shared/types';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'POST') return methodNotAllowed();
  const id = getQueryParam(req, 'id');
  if (!id) return badRequest('id is required');

  const [existing] = await db().select().from(lectures).where(eq(lectures.id, id)).limit(1);
  if (!existing) return notFound('lecture not found');

  const [row] = await db()
    .update(lectures)
    .set({ status: 'ended', endedAt: new Date() })
    .where(eq(lectures.id, id))
    .returning();
  if (!row) return error('internal', 'update returned no row', 500);

  // Trigger background feedback generation.
  const url = new URL(req.url);
  const bgUrl = `${url.origin}/.netlify/functions/generate-feedback-background`;
  fetch(bgUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lectureId: id }),
  }).catch(() => undefined);

  const body: EndSessionResponse = {
    endedAt: row.endedAt!.toISOString(),
    status: 'ended',
    feedbackJobId: id,
  };
  return json(body, 202);
}

export const config = { path: '/.netlify/functions/lecture-end' };
