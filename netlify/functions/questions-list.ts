/**
 * OWNER: P2 (Backend)
 * GET /api/lectures/:id/questions?status=...   — teacher panel polling
 */
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { questions } from '../../db/schema';
import {
  json,
  badRequest,
  getQueryParam,
  methodNotAllowed,
  handleOptions,
} from './_lib/response';
import type { ListQuestionsResponse, Question, QuestionStatus } from '../../shared/types';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'GET') return methodNotAllowed();
  const lectureId = getQueryParam(req, 'id');
  if (!lectureId) return badRequest('id is required');
  const status = getQueryParam(req, 'status') as QuestionStatus | null;
  const studentSessionId = getQueryParam(req, 'studentSessionId');

  let where = eq(questions.lectureId, lectureId);
  if (status) {
    where = and(where, eq(questions.status, status))!;
  }
  if (studentSessionId) {
    where = and(where, eq(questions.studentSessionId, studentSessionId))!;
  }

  const rows = await db().select().from(questions).where(where).orderBy(desc(questions.askedAt));

  const body: ListQuestionsResponse = {
    questions: rows.map<Question>((r) => ({
      id: r.id,
      lectureId: r.lectureId,
      studentSessionId: r.studentSessionId,
      questionText: r.questionText,
      askedAt: r.askedAt.toISOString(),
      status: r.status,
      routerDecision: r.routerDecision,
      aiAnswer: r.aiAnswer,
      aiAnswerConfidence: r.aiAnswerConfidence,
      aiAnswerCitations: r.aiAnswerCitations,
      teacherResponse: r.teacherResponse,
      flaggedReason: r.flaggedReason,
    })),
  };
  return json(body);
}

export const config = { path: '/.netlify/functions/questions-list' };
