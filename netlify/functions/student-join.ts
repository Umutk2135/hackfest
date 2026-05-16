/**
 * OWNER: P2 (Backend)
 * POST /api/lectures/:id/student-join
 */
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { lectures, studentSessions } from '../../db/schema';
import {
  json,
  badRequest,
  notFound,
  getQueryParam,
  methodNotAllowed,
  handleOptions,
  error,
  readJson,
} from './_lib/response';
import type { StudentJoinRequest, StudentJoinResponse } from '../../shared/types';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'POST') return methodNotAllowed();
  const lectureId = getQueryParam(req, 'id');
  if (!lectureId) return badRequest('id is required');
  const body = await readJson<StudentJoinRequest>(req);
  if (!body.studentName || !body.studentId) return badRequest('studentName and studentId required');

  const [lecture] = await db().select().from(lectures).where(eq(lectures.id, lectureId)).limit(1);
  if (!lecture) return notFound('lecture not found');

  const [row] = await db()
    .insert(studentSessions)
    .values({
      lectureId,
      studentName: body.studentName,
      studentId: body.studentId,
    })
    .returning();
  if (!row) return error('internal', 'insert returned no row', 500);

  const resp: StudentJoinResponse = { studentSessionId: row.id };
  return json(resp, 201);
}

export const config = { path: '/.netlify/functions/student-join' };
