/**
 * OWNER: P2 (Backend)
 * POST /api/questions/:id/teacher-response
 */
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { questions } from '../../db/schema';
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
import type { TeacherRespondRequest, TeacherRespondResponse } from '../../shared/types';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'POST') return methodNotAllowed();
  const id = getQueryParam(req, 'id');
  if (!id) return badRequest('id is required');
  const body = await readJson<TeacherRespondRequest>(req);
  if (!body.teacherResponse?.trim()) return badRequest('teacherResponse required');

  const [existing] = await db().select().from(questions).where(eq(questions.id, id)).limit(1);
  if (!existing) return notFound('question not found');

  const [row] = await db()
    .update(questions)
    .set({ teacherResponse: body.teacherResponse, status: 'answered_by_teacher' })
    .where(eq(questions.id, id))
    .returning();
  if (!row) return error('internal', 'update returned no row', 500);

  const resp: TeacherRespondResponse = { questionId: row.id, status: 'answered_by_teacher' };
  return json(resp);
}

export const config = { path: '/.netlify/functions/question-teacher-respond' };
