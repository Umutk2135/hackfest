/**
 * OWNER: P3 (AI)
 * Background job: chunk a lecture_notes row + embed each chunk + insert into note_chunks.
 *
 * Invoked from netlify/functions/notes-upload.ts.
 * Netlify Background Functions get up to 15 minutes.
 */
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { lectureNotes, noteChunks } from '../../db/schema';
import { chunkPdfText, chunkText } from '../../agents/chunking';
import { embedTexts } from '../../agents/embedding';
import { readJson } from '../functions/_lib/response';

interface Payload {
  noteId: string;
  lectureId: string;
}

export default async function handler(req: Request) {
  const { noteId, lectureId } = await readJson<Payload>(req);
  if (!noteId || !lectureId) {
    return new Response('bad request', { status: 400 });
  }

  const [note] = await db()
    .select()
    .from(lectureNotes)
    .where(eq(lectureNotes.id, noteId))
    .limit(1);
  if (!note) return new Response('note not found', { status: 404 });

  const chunks =
    note.uploadMethod === 'pdf' ? chunkPdfText(note.rawText) : chunkText(note.rawText);
  if (chunks.length === 0) return new Response('no chunks', { status: 200 });

  const vectors = await embedTexts(chunks.map((c) => c.content));

  await db()
    .insert(noteChunks)
    .values(
      chunks.map((c, i) => ({
        lectureId,
        sourceNoteId: noteId,
        chunkIndex: c.index,
        content: c.content,
        embedding: vectors[i]!,
        pageReference: c.pageReference ?? null,
      })),
    );

  return new Response(JSON.stringify({ ok: true, chunks: chunks.length }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

export const config = { path: '/.netlify/functions/background-embed-notes' };
