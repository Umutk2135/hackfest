/**
 * OWNER: P2 (Backend)
 * GET /api/lectures/:id/transcript?since=N  — incremental polling endpoint
 */
import { and, asc, eq, gte, max } from 'drizzle-orm';
import { db } from '../../db/client';
import { transcriptSegments } from '../../db/schema';
import {
  json,
  badRequest,
  getQueryParam,
  methodNotAllowed,
  handleOptions,
} from './_lib/response';
import type { TranscriptGetResponse, TranscriptSegment } from '../../shared/types';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'GET') return methodNotAllowed();
  const lectureId = getQueryParam(req, 'id');
  if (!lectureId) return badRequest('id is required');
  const sinceParam = getQueryParam(req, 'since');
  const since = sinceParam !== null ? Number.parseInt(sinceParam, 10) : -1;

  const rows = await db()
    .select()
    .from(transcriptSegments)
    .where(
      and(
        eq(transcriptSegments.lectureId, lectureId),
        since >= 0 ? gte(transcriptSegments.segmentIndex, since) : undefined,
      ),
    )
    .orderBy(asc(transcriptSegments.segmentIndex));

  const segments: TranscriptSegment[] = rows.map((r) => ({
    id: r.id,
    lectureId: r.lectureId,
    segmentIndex: r.segmentIndex,
    content: r.content,
    startTimeSeconds: r.startTimeSeconds,
    endTimeSeconds: r.endTimeSeconds,
    createdAt: r.createdAt.toISOString(),
  }));

  const [maxRow] = await db()
    .select({ latestIndex: max(transcriptSegments.segmentIndex) })
    .from(transcriptSegments)
    .where(eq(transcriptSegments.lectureId, lectureId));
  const latestIndex =
    maxRow?.latestIndex != null ? Number(maxRow.latestIndex) : since >= 0 ? since : -1;

  const body: TranscriptGetResponse = { segments, latestIndex };
  return json(body);
}

export const config = { path: '/.netlify/functions/transcript-get' };
