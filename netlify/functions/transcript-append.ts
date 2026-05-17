/**
 * OWNER: P2 (Backend)
 * POST /api/lectures/:id/transcript/append
 * Called by the teacher's browser every ~3 seconds with a new transcript segment.
 * Triggers background-embed-transcript on a debounce.
 */
import { and, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { transcriptSegments, lectures } from '../../db/schema';
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
import type { TranscriptAppendRequest, TranscriptAppendResponse } from '../../shared/types';
import { MAX_TRANSCRIPT_CHARS } from '../../shared/types';

// Debounce state per cold-start. Each lecture's transcript embed is triggered at most every 60s.
const lastEmbedTriggerMs = new Map<string, number>();
const EMBED_DEBOUNCE_MS = 60_000;

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'POST') return methodNotAllowed();
  const lectureId = getQueryParam(req, 'id');
  if (!lectureId) return badRequest('id is required');

  const body = await readJson<TranscriptAppendRequest>(req);
  if (
    typeof body.segmentIndex !== 'number' ||
    !Number.isInteger(body.segmentIndex) ||
    body.segmentIndex < 0 ||
    !body.content?.trim()
  ) {
    return badRequest('segmentIndex and content required');
  }
  if (
    !Number.isFinite(body.startTimeSeconds) ||
    !Number.isFinite(body.endTimeSeconds) ||
    body.startTimeSeconds < 0 ||
    body.endTimeSeconds < body.startTimeSeconds
  ) {
    return badRequest('invalid transcript timestamps');
  }
  if (body.content.length > MAX_TRANSCRIPT_CHARS) {
    return error('too_large', 'segment too large', 413);
  }

  const [lecture] = await db().select().from(lectures).where(eq(lectures.id, lectureId)).limit(1);
  if (!lecture) return notFound('lecture not found');
  if (lecture.status !== 'live') {
    return error('invalid_state', 'lecture is not live', 409);
  }

  const [row] = await db()
    .insert(transcriptSegments)
    .values({
      lectureId,
      segmentIndex: body.segmentIndex,
      content: body.content,
      startTimeSeconds: body.startTimeSeconds,
      endTimeSeconds: body.endTimeSeconds,
    })
    .onConflictDoNothing()
    .returning();

  if (row) {
    // Debounced embedding only; transcript ingestion never calls an LLM.
    const now = Date.now();
    const last = lastEmbedTriggerMs.get(lectureId) ?? 0;
    if (now - last >= EMBED_DEBOUNCE_MS) {
      lastEmbedTriggerMs.set(lectureId, now);
      const url = new URL(req.url);
      await fetch(`${url.origin}/.netlify/functions/embed-transcript-background`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lectureId }),
      }).catch(() => undefined);
    }
  }

  let segmentId = row?.id;
  if (!segmentId) {
    const [existing] = await db()
      .select({ id: transcriptSegments.id })
      .from(transcriptSegments)
      .where(
        and(
          eq(transcriptSegments.lectureId, lectureId),
          eq(transcriptSegments.segmentIndex, body.segmentIndex),
        ),
      )
      .limit(1);
    segmentId = existing?.id;
  }

  const resp: TranscriptAppendResponse = { ok: true, segmentId: segmentId ?? '' };
  return json(resp);
}

export const config = { path: '/.netlify/functions/transcript-append' };
