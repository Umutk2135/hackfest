/**
 * OWNER: P2 (Backend)
 * GET /api/lectures/:id/feedback
 * Returns 202 { status: 'generating' } until the row exists, then 200 with the full report.
 */
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { feedbackReports, lectures } from '../../db/schema';
import {
  json,
  badRequest,
  notFound,
  getQueryParam,
  methodNotAllowed,
  handleOptions,
} from './_lib/response';
import type { FeedbackReport, GetFeedbackResponse } from '../../shared/types';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'GET') return methodNotAllowed();
  const lectureId = getQueryParam(req, 'id');
  if (!lectureId) return badRequest('id is required');

  const [lecture] = await db().select().from(lectures).where(eq(lectures.id, lectureId)).limit(1);
  if (!lecture) return notFound('lecture not found');

  const [report] = await db()
    .select()
    .from(feedbackReports)
    .where(eq(feedbackReports.lectureId, lectureId))
    .limit(1);

  if (!report) {
    const body: GetFeedbackResponse = { status: 'generating' };
    return json(body, 202);
  }

  const wire: FeedbackReport = {
    id: report.id,
    lectureId: report.lectureId,
    overallClarityScore: report.overallClarityScore,
    overallPacingScore: report.overallPacingScore,
    overallEngagementScore: report.overallEngagementScore,
    rushedConcepts: report.rushedConcepts,
    unansweredThreads: report.unansweredThreads,
    missingExamples: report.missingExamples,
    pacingAnalysis: report.pacingAnalysis,
    suggestedImprovements: report.suggestedImprovements,
    topConfusionPoints: report.topConfusionPoints,
    generatedAt: report.generatedAt.toISOString(),
    generationDurationMs: report.generationDurationMs,
  };
  const body: GetFeedbackResponse = { status: 'ready', report: wire };
  return json(body);
}

export const config = { path: '/.netlify/functions/feedback-get' };
