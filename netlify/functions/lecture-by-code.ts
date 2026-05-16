/**
 * OWNER: P2 (Backend)
 * GET /api/lectures/by-code/:code  — student lookup by session code
 */
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { lectures } from '../../db/schema';
import { json, notFound, badRequest, getQueryParam, methodNotAllowed, handleOptions } from './_lib/response';
import type { LectureByCodeResponse } from '../../shared/types';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'GET') return methodNotAllowed();
  const code = getQueryParam(req, 'code');
  if (!code) return badRequest('code is required');

  const [row] = await db().select().from(lectures).where(eq(lectures.sessionCode, code)).limit(1);
  if (!row) return notFound('lecture not found');

  const body: LectureByCodeResponse = {
    lecture: {
      id: row.id,
      teacherId: row.teacherId,
      title: row.title,
      subject: row.subject,
      description: row.description,
      status: row.status,
      sessionCode: row.sessionCode,
      createdAt: row.createdAt.toISOString(),
      startedAt: row.startedAt?.toISOString() ?? null,
      endedAt: row.endedAt?.toISOString() ?? null,
    },
    isLive: row.status === 'live',
  };
  return json(body);
}

export const config = { path: '/.netlify/functions/lecture-by-code' };
