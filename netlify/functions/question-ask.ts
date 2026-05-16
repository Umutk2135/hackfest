/**
 * OWNER: P2 (Backend) + P3 (AI) — shared file. The orchestrator (P3) lives in agents/index.ts.
 *
 * POST /api/lectures/:id/questions  — SSE stream
 *
 * Protocol:
 *   event: status     — agent pipeline progress
 *   event: token      — answer text fragments (sent in one chunk for now; streaming swap in Phase 3)
 *   event: citation   — one citation each
 *   event: done       — final question id + status
 *   event: error      — fatal error
 */
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { questions, lectures } from '../../db/schema';
import {
  badRequest,
  notFound,
  getQueryParam,
  handleOptions,
  methodNotAllowed,
  error as errorResponse,
  readJson,
  sseStream,
} from './_lib/response';
import { take, clientKey } from './_lib/ratelimit';
import { orchestrate } from '../../agents';
import type { AskQuestionRequest, SseQuestionEvent, QuestionStatus } from '../../shared/types';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'POST') return methodNotAllowed();
  const lectureId = getQueryParam(req, 'id');
  if (!lectureId) return badRequest('id is required');

  if (!take(`question:${clientKey(req)}`)) {
    return errorResponse('rate_limited', 'Çok hızlı soru gönderdiniz; lütfen bekleyin.', 429);
  }

  const body = await readJson<AskQuestionRequest>(req);
  if (!body.studentSessionId || !body.questionText) {
    return badRequest('studentSessionId and questionText required');
  }

  const [lecture] = await db().select().from(lectures).where(eq(lectures.id, lectureId)).limit(1);
  if (!lecture) return notFound('lecture not found');

  // Create the question row up-front so polling endpoints can see it.
  const [questionRow] = await db()
    .insert(questions)
    .values({
      lectureId,
      studentSessionId: body.studentSessionId,
      questionText: body.questionText,
      status: 'pending',
    })
    .returning();
  if (!questionRow) {
    return errorResponse('internal', 'failed to persist question', 500);
  }

  async function* events(): AsyncGenerator<{ event: string; data: unknown }> {
    let finalStatus: QuestionStatus = 'pending';
    let finalConfidence: number | undefined;

    for await (const evt of orchestrate(lectureId!, body.questionText)) {
      if (evt.type === 'status') {
        const payload: SseQuestionEvent = {
          event: 'status',
          data: { agent: evt.agent, state: evt.state, ...(evt.payload ?? {}) },
        };
        yield payload;
        continue;
      }
      if (evt.type === 'decline') {
        await db()
          .update(questions)
          .set({
            status: 'answered_by_ai',
            aiAnswer: evt.reason,
            aiAnswerConfidence: 0,
          })
          .where(eq(questions.id, questionRow!.id));
        yield { event: 'token', data: { text: evt.reason } };
        finalStatus = 'answered_by_ai';
        finalConfidence = 0;
        break;
      }
      if (evt.type === 'forward_to_teacher') {
        await db()
          .update(questions)
          .set({
            status: 'flagged_for_teacher',
            routerDecision: evt.routerDecision,
            flaggedReason: evt.routerDecision.reasoning,
          })
          .where(eq(questions.id, questionRow!.id));
        yield {
          event: 'token',
          data: { text: 'Bu soru öğretmeninize iletildi.' },
        };
        finalStatus = 'flagged_for_teacher';
        break;
      }
      if (evt.type === 'answer') {
        const { result, routerDecision, flag } = evt;
        const status: QuestionStatus = flag.escalate ? 'flagged_for_teacher' : 'answered_by_ai';
        await db()
          .update(questions)
          .set({
            status,
            routerDecision,
            aiAnswer: result.answer,
            aiAnswerConfidence: result.confidence,
            aiAnswerCitations: result.citations,
            flaggedReason: flag.escalate ? flag.reason : null,
          })
          .where(eq(questions.id, questionRow!.id));

        yield { event: 'token', data: { text: result.answer } };
        for (const c of result.citations) {
          yield { event: 'citation', data: c };
        }
        finalStatus = status;
        finalConfidence = result.confidence;
        break;
      }
    }

    yield {
      event: 'done',
      data: {
        questionId: questionRow!.id,
        status: finalStatus,
        ...(finalConfidence !== undefined ? { confidence: finalConfidence } : {}),
      },
    };
  }

  return sseStream(events());
}

export const config = { path: '/.netlify/functions/question-ask' };
