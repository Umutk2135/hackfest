/**
 * OWNER: P3 (AI)
 * RAG retrieval: pgvector top-K over notes + transcript chunks for a given lecture.
 */
import { sql } from 'drizzle-orm';
import { db } from '../db/client';
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
  const queryVec = await embedQuery(query);
  const vecLiteral = `[${queryVec.join(',')}]`;

  const conn = db();
  const promises: Array<Promise<RetrievedChunk[]>> = [];
  if (!opts.transcriptOnly) {
    promises.push(
      conn.execute(sql`
        SELECT id::text AS chunk_id,
               content,
               page_reference,
               1 - (embedding <=> ${vecLiteral}::vector) AS score
        FROM note_chunks
        WHERE lecture_id = ${lectureId}
        ORDER BY embedding <=> ${vecLiteral}::vector
        LIMIT ${k}
      `).then((r) =>
        (r.rows as Array<{ chunk_id: string; content: string; page_reference: string | null; score: number }>).map(
          (row) => ({
            chunk_id: row.chunk_id,
            source_type: 'note' as const,
            reference: row.page_reference ?? 'not',
            content: row.content,
            score: Number(row.score),
          }),
        ),
      ),
    );
  }
  promises.push(
    conn.execute(sql`
      SELECT id::text AS chunk_id,
             content,
             start_time_seconds,
             1 - (embedding <=> ${vecLiteral}::vector) AS score
      FROM transcript_segments
      WHERE lecture_id = ${lectureId} AND embedding IS NOT NULL
      ORDER BY embedding <=> ${vecLiteral}::vector
      LIMIT ${k}
    `).then((r) =>
      (r.rows as Array<{ chunk_id: string; content: string; start_time_seconds: number; score: number }>).map(
        (row) => ({
          chunk_id: row.chunk_id,
          source_type: 'transcript' as const,
          reference: mmss(row.start_time_seconds),
          content: row.content,
          score: Number(row.score),
        }),
      ),
    ),
  );

  const results = (await Promise.all(promises)).flat();
  return results
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
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
