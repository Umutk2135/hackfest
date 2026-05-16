/**
 * OWNER: P3 (AI)
 * Background job: embed any un-embedded transcript_segments for a lecture.
 * Invoked debounced (every ~60s) from netlify/functions/transcript-append.ts.
 */
import { and, eq, isNull, asc, inArray } from 'drizzle-orm';
import { db } from '../../db/client';
import { transcriptSegments } from '../../db/schema';
import { embedTexts } from '../../agents/embedding';
import { readJson } from '../functions/_lib/response';

interface Payload {
  lectureId: string;
}

const BATCH = 32;

export default async function handler(req: Request) {
  const { lectureId } = await readJson<Payload>(req);
  if (!lectureId) return new Response('bad request', { status: 400 });

  const pending = await db()
    .select()
    .from(transcriptSegments)
    .where(and(eq(transcriptSegments.lectureId, lectureId), isNull(transcriptSegments.embedding)))
    .orderBy(asc(transcriptSegments.segmentIndex))
    .limit(200);

  if (pending.length === 0) {
    return new Response(JSON.stringify({ ok: true, embedded: 0 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  let total = 0;
  for (let i = 0; i < pending.length; i += BATCH) {
    const slice = pending.slice(i, i + BATCH);
    const vectors = await embedTexts(slice.map((s) => s.content));
    // Update each row individually — pgvector update via Drizzle (no bulk update primitive yet).
    await Promise.all(
      slice.map((seg, idx) =>
        db()
          .update(transcriptSegments)
          .set({ embedding: vectors[idx]! })
          .where(eq(transcriptSegments.id, seg.id)),
      ),
    );
    total += slice.length;
  }

  return new Response(JSON.stringify({ ok: true, embedded: total }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

// keep `inArray` import warning-free for future bulk-update refactor.
void inArray;

export const config = { path: '/.netlify/functions/background-embed-transcript' };
