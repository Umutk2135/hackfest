/**
 * OWNER: P2 (Backend)
 * GET /api/lectures/:id
 */
import { eq, count } from 'drizzle-orm';
import { db } from '../../db/client';
import { lectures, lectureNotes, transcriptSegments, questions, noteChunks } from '../../db/schema';
import { json, notFound, badRequest, getQueryParam, methodNotAllowed, handleOptions } from './_lib/response';
import type { GetLectureResponse, LectureNote } from '../../shared/types';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'GET') return methodNotAllowed();
  const id = getQueryParam(req, 'id');
  if (!id) return badRequest('id is required');

  const conn = db();
  const [lecture] = await conn.select().from(lectures).where(eq(lectures.id, id)).limit(1);
  if (!lecture) return notFound('lecture not found');

  const notes = await conn.select().from(lectureNotes).where(eq(lectureNotes.lectureId, id));
  const [transcriptCount] = await conn
    .select({ n: count() })
    .from(transcriptSegments)
    .where(eq(transcriptSegments.lectureId, id));
  const [questionCount] = await conn
    .select({ n: count() })
    .from(questions)
    .where(eq(questions.lectureId, id));

  // Per-note chunk counts (one query — group by source_note_id).
  const chunkCounts = await conn
    .select({ noteId: noteChunks.sourceNoteId, n: count() })
    .from(noteChunks)
    .where(eq(noteChunks.lectureId, id))
    .groupBy(noteChunks.sourceNoteId);
  const chunkCountByNote = new Map(chunkCounts.map((r) => [r.noteId, Number(r.n)]));

  const body: GetLectureResponse = {
    lecture: {
      id: lecture.id,
      teacherId: lecture.teacherId,
      title: lecture.title,
      subject: lecture.subject,
      description: lecture.description,
      status: lecture.status,
      sessionCode: lecture.sessionCode,
      createdAt: lecture.createdAt.toISOString(),
      startedAt: lecture.startedAt?.toISOString() ?? null,
      endedAt: lecture.endedAt?.toISOString() ?? null,
    },
    notes: notes.map<LectureNote>((n) => ({
      id: n.id,
      lectureId: n.lectureId,
      filename: n.filename,
      uploadMethod: n.uploadMethod,
      rawTextPreview: n.rawText.slice(0, 500),
      chunkCount: chunkCountByNote.get(n.id) ?? 0,
      createdAt: n.createdAt.toISOString(),
    })),
    transcriptCount: Number(transcriptCount?.n ?? 0),
    questionCount: Number(questionCount?.n ?? 0),
  };
  return json(body);
}

export const config = { path: '/.netlify/functions/lecture-by-id' };
