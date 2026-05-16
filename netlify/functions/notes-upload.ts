/**
 * OWNER: P2 (Backend)
 * POST /api/lectures/:id/notes
 *
 * Accepts either:
 *   - Content-Type: multipart/form-data with field `file` (PDF)
 *   - Content-Type: application/json with body { rawText: string }
 *
 * Writes the raw text to lecture_notes, then triggers background-embed-notes.
 */
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { lectureNotes, lectures } from '../../db/schema';
import {
  json,
  error,
  badRequest,
  notFound,
  getQueryParam,
  methodNotAllowed,
  handleOptions,
  readJson,
} from './_lib/response';
import { extractPdf } from './_lib/pdf';
import type { UploadNotesPasteRequest, UploadNotesResponse } from '../../shared/types';
import { MAX_NOTES_PAGES } from '../../shared/types';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'POST') return methodNotAllowed();
  const lectureId = getQueryParam(req, 'id');
  if (!lectureId) return badRequest('id is required');

  const [lecture] = await db().select().from(lectures).where(eq(lectures.id, lectureId)).limit(1);
  if (!lecture) return notFound('lecture not found');

  const contentType = req.headers.get('content-type') ?? '';

  let rawText: string;
  let filename: string | null = null;
  let uploadMethod: 'pdf' | 'paste';

  if (contentType.startsWith('multipart/form-data')) {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return badRequest('file field missing');
    filename = file.name;
    uploadMethod = 'pdf';
    const buf = Buffer.from(await file.arrayBuffer());
    const extracted = await extractPdf(buf);
    if (extracted.pageCount > MAX_NOTES_PAGES) {
      return error('too_large', `PDF en fazla ${MAX_NOTES_PAGES} sayfa olabilir`, 413);
    }
    rawText = extracted.text;
  } else {
    const body = await readJson<UploadNotesPasteRequest>(req);
    if (!body.rawText?.trim()) return badRequest('rawText required');
    rawText = body.rawText;
    uploadMethod = 'paste';
  }

  const [note] = await db()
    .insert(lectureNotes)
    .values({ lectureId, filename, rawText, uploadMethod })
    .returning();
  if (!note) return error('internal', 'insert returned no row', 500);

  // Trigger background embedding (fire-and-forget).
  const url = new URL(req.url);
  const bgUrl = `${url.origin}/.netlify/functions/background-embed-notes`;
  fetch(bgUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ noteId: note.id, lectureId }),
  }).catch(() => {
    // Best-effort. Frontend polls chunk counts to know when ready.
  });

  const resp: UploadNotesResponse = { noteId: note.id, chunkingJobId: note.id };
  return json(resp, 202);
}

export const config = { path: '/.netlify/functions/notes-upload' };
