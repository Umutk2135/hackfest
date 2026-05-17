/**
 * OWNER: P3 (AI)
 * Background job: run the Feedback Agent on a completed lecture and persist the row.
 * Invoked from netlify/functions/lecture-end.ts.
 */
import { asc, desc, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import {
  feedbackReports,
  lectures,
  lectureNotes,
  questions,
  transcriptSegments,
} from '../../db/schema';
import { generateFeedback } from '../../agents/feedback';
import { readJson } from '../functions/_lib/response';
import { sendFeedbackReportEmail } from '../functions/_lib/email';

interface Payload {
  lectureId: string;
}

export default async function handler(req: Request) {
  const { lectureId } = await readJson<Payload>(req);
  if (!lectureId) return new Response('bad request', { status: 400 });

  const start = Date.now();
  const conn = db();

  const [lecture] = await conn.select().from(lectures).where(eq(lectures.id, lectureId)).limit(1);
  if (!lecture) return new Response('lecture not found', { status: 404 });

  const notesRows = await conn
    .select()
    .from(lectureNotes)
    .where(eq(lectureNotes.lectureId, lectureId));

  const transcript = await conn
    .select()
    .from(transcriptSegments)
    .where(eq(transcriptSegments.lectureId, lectureId))
    .orderBy(asc(transcriptSegments.segmentIndex));

  const qaRows = await conn
    .select()
    .from(questions)
    .where(eq(questions.lectureId, lectureId))
    .orderBy(desc(questions.askedAt));

  const lastSegment = transcript[transcript.length - 1];
  const durationSeconds = lastSegment ? lastSegment.endTimeSeconds : 0;

  const result = await generateFeedback({
    title: lecture.title,
    subject: lecture.subject,
    durationSeconds,
    notesText: notesRows.map((n) => n.rawText).join('\n\n'),
    transcript: transcript.map((t) => ({ content: t.content, startTimeSeconds: t.startTimeSeconds })),
    qaLog: qaRows.map((r) => ({
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
  });

  const [persisted] = await conn
    .insert(feedbackReports)
    .values({
      lectureId,
      overallClarityScore: result.overallClarityScore,
      overallPacingScore: result.overallPacingScore,
      overallEngagementScore: result.overallEngagementScore,
      rushedConcepts: result.rushedConcepts,
      unansweredThreads: result.unansweredThreads,
      missingExamples: result.missingExamples,
      pacingAnalysis: result.pacingAnalysis,
      suggestedImprovements: result.suggestedImprovements,
      topConfusionPoints: result.topConfusionPoints,
      generationDurationMs: Date.now() - start,
    })
    .onConflictDoNothing({ target: feedbackReports.lectureId })
    .returning();

  const emailResult = persisted
    ? await sendFeedbackReportEmail({
        lectureTitle: lecture.title,
        lectureSubject: lecture.subject,
        report: {
          id: persisted.id,
          lectureId: persisted.lectureId,
          overallClarityScore: persisted.overallClarityScore,
          overallPacingScore: persisted.overallPacingScore,
          overallEngagementScore: persisted.overallEngagementScore,
          rushedConcepts: persisted.rushedConcepts,
          unansweredThreads: persisted.unansweredThreads,
          missingExamples: persisted.missingExamples,
          pacingAnalysis: persisted.pacingAnalysis,
          suggestedImprovements: persisted.suggestedImprovements,
          topConfusionPoints: persisted.topConfusionPoints,
          generatedAt: persisted.generatedAt.toISOString(),
          generationDurationMs: persisted.generationDurationMs,
        },
      }).catch((err) => ({ skipped: true, reason: `email failed: ${(err as Error).message}` }))
    : { skipped: true, reason: 'report already existed' };

  console.log('[feedback-email]', JSON.stringify({ lectureId, ...emailResult }));

  return new Response(JSON.stringify({ ok: true, ms: Date.now() - start, email: emailResult }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

export const config = { path: '/.netlify/functions/generate-feedback-background' };
