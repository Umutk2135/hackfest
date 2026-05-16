/**
 * OWNER: P3 (AI)
 * Feedback Agent — runs once at lecture end. Streams the JSON response so the UI can
 * progressively populate the report.
 */
import { claude, cachedSystem, MODELS, withRetry } from './claude';
import { FEEDBACK_SYSTEM_PROMPT } from './prompts/feedback';
import { xml, mmss } from './prompts/shared';
import type { FeedbackReport, Question, TranscriptSegment } from '../shared/types';

export interface FeedbackInput {
  title: string;
  subject: string;
  durationSeconds: number;
  notesText: string;
  transcript: Pick<TranscriptSegment, 'content' | 'startTimeSeconds'>[];
  qaLog: Question[];
}

export type StreamingFeedback = Omit<FeedbackReport, 'id' | 'lectureId' | 'generatedAt' | 'generationDurationMs'>;

/**
 * Non-streaming for the stub. Phase 3 swaps this for the streaming variant that yields
 * tokens to the SSE consumer.
 */
export async function generateFeedback(input: FeedbackInput): Promise<StreamingFeedback> {
  const res = await withRetry(() =>
    claude().messages.create({
      model: MODELS.BIG,
      max_tokens: 4000,
      system: cachedSystem(FEEDBACK_SYSTEM_PROMPT),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: xml(
                'lecture_meta',
                JSON.stringify({
                  title: input.title,
                  subject: input.subject,
                  duration_seconds: input.durationSeconds,
                }),
              ),
            },
            { type: 'text', text: xml('notes', input.notesText) },
            { type: 'text', text: xml('transcript', renderTranscript(input.transcript)) },
            { type: 'text', text: xml('qa_log', renderQa(input.qaLog)) },
          ],
        },
      ],
    }),
  );

  const text = res.content.find((b) => b.type === 'text')?.text ?? '';
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    overallClarityScore: parsed.overall_clarity_score,
    overallPacingScore: parsed.overall_pacing_score,
    overallEngagementScore: parsed.overall_engagement_score,
    rushedConcepts: parsed.rushed_concepts ?? [],
    unansweredThreads: parsed.unanswered_threads ?? [],
    missingExamples: parsed.missing_examples ?? [],
    pacingAnalysis: parsed.pacing_analysis ?? [],
    suggestedImprovements: parsed.suggested_improvements ?? [],
    topConfusionPoints: parsed.top_confusion_points ?? [],
  };
}

function renderTranscript(segs: FeedbackInput['transcript']): string {
  return segs.map((s) => `[${mmss(s.startTimeSeconds)}] ${s.content}`).join('\n');
}

function renderQa(qa: Question[]): string {
  return qa
    .map(
      (q) =>
        `Q[${q.askedAt}] ${q.questionText}\n  AI: ${q.aiAnswer ?? '(no answer)'}${
          q.teacherResponse ? `\n  Teacher: ${q.teacherResponse}` : ''
        }${q.flaggedReason ? `\n  Flagged: ${q.flaggedReason}` : ''}`,
    )
    .join('\n\n');
}
