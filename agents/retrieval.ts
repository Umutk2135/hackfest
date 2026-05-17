/**
 * OWNER: P3 (AI)
 * RAG retrieval: cosine top-K over notes + transcript chunks for a given lecture.
 */
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { lectureNotes, noteChunks, transcriptSegments } from '../db/schema';
import { chunkPdfText, chunkText } from './chunking';
import { embedQuery } from './embedding';
import { mmss } from './prompts/shared';
import type { Citation } from '../shared/types';

export interface RetrievedChunk {
  chunk_id: string;
  source_type: 'note' | 'transcript';
  /** Human-readable reference: "sayfa 2" or "03:42". */
  reference: string;
  content: string;
  /** Cosine similarity 0..1 (1 = identical). */
  score: number;
}

export interface RetrievalOptions {
  /** If true, only search transcript (Router said "live_transcript"). */
  transcriptOnly?: boolean;
  k?: number;
  /** Drop chunks below this cosine similarity. Tuned on demo data in Phase 4. */
  minScore?: number;
}

export async function retrieve(
  lectureId: string,
  query: string,
  opts: RetrievalOptions = {},
): Promise<RetrievedChunk[]> {
  const k = opts.k ?? 5;
  const minScore = opts.minScore ?? 0.2;
  const queryVec = await embedQuery(query).catch(() => null);

  const conn = db();
  const promises: Array<Promise<RetrievedChunk[]>> = [];
  const noteRowsPromise = opts.transcriptOnly
    ? Promise.resolve([])
    : conn.select().from(lectureNotes).where(eq(lectureNotes.lectureId, lectureId));
  if (!opts.transcriptOnly && queryVec) {
    promises.push(
      conn
        .select()
        .from(noteChunks)
        .where(eq(noteChunks.lectureId, lectureId))
        .then((rows) =>
          rows.map((row) => ({
            chunk_id: row.id,
            source_type: 'note' as const,
            reference: row.pageReference ?? 'not',
            content: row.content,
            score: cosineSimilarity(queryVec, row.embedding),
          })),
        ),
    );
  }
  const transcriptRowsPromise = conn
    .select()
    .from(transcriptSegments)
    .where(eq(transcriptSegments.lectureId, lectureId));
  if (queryVec) {
    promises.push(
      transcriptRowsPromise.then((rows) =>
        rows
          .filter((row) => row.embedding !== null)
          .map((row) => ({
            chunk_id: row.id,
            source_type: 'transcript' as const,
            reference: mmss(row.startTimeSeconds),
            content: row.content,
            score: cosineSimilarity(queryVec, row.embedding!),
          })),
      ),
    );
  }

  const [results, transcriptRows] = await Promise.all([
    Promise.all(promises).then((items) => items.flat()),
    transcriptRowsPromise,
  ]);
  const noteRows = await noteRowsPromise;

  const noteFallback = opts.transcriptOnly
    ? []
    : noteRows
        .flatMap((note) => {
          const chunks =
            note.uploadMethod === 'pdf' ? chunkPdfText(note.rawText) : chunkText(note.rawText);
          return chunks.map((chunk) => ({
            chunk_id: `note:${note.id}:${chunk.index}`,
            source_type: 'note' as const,
            reference: chunk.pageReference ?? 'not',
            content: chunk.content,
            score: lexicalScore(query, chunk.content),
          }));
        })
        .filter(
          (chunk) =>
            chunk.score > 0 &&
            !results.some((existing) => normalizeForCompare(existing.content) === normalizeForCompare(chunk.content)),
        );

  const transcriptFallback = transcriptRows
    .filter((row) => !results.some((chunk) => chunk.chunk_id === row.id))
    .map((row) => ({
      chunk_id: row.id,
      source_type: 'transcript' as const,
      reference: mmss(row.startTimeSeconds),
      content: row.content,
      score: lexicalScore(query, row.content, opts.transcriptOnly),
    }))
    .filter((chunk) => chunk.score > 0);

  return [...results, ...noteFallback, ...transcriptFallback]
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function lexicalScore(query: string, content: string, transcriptOnly = false): number {
  const q = tokenize(query);
  const c = new Set(tokenize(content));
  if (q.length === 0 || c.size === 0) return transcriptOnly ? 0.3 : 0;

  const hits = q.filter((token) => c.has(token)).length;
  const ratio = hits / q.length;
  if (ratio > 0) return Math.min(0.75, 0.25 + ratio);

  // For "az once ne dedi" style live transcript questions, recent transcript is still relevant.
  return transcriptOnly ? 0.3 : 0;
}

function tokenize(value: string): string[] {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

function normalizeForCompare(value: string): string {
  return value.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();
}

/** Convert a retrieved chunk into the API Citation shape. */
export function chunkToCitation(c: RetrievedChunk): Citation {
  return {
    source_type: c.source_type,
    reference: c.reference,
    snippet: c.content.slice(0, 200),
    chunk_id: c.chunk_id,
  };
}
