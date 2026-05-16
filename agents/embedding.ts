/**
 * OWNER: P3 (AI)
 * Voyage AI client wrapper. voyage-3-large → 1024-dimensional embeddings, strong tr/en support.
 * Batches in groups of 32 (Voyage limit is higher but 32 keeps payloads small + parallelizable).
 */
import { VoyageAIClient } from 'voyageai';
import { EMBEDDING_DIM } from '../shared/types';

const BATCH_SIZE = 32;
const MODEL = 'voyage-3-large';

let _client: VoyageAIClient | null = null;
function voyage() {
  if (_client) return _client;
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error('VOYAGE_API_KEY is not set');
  _client = new VoyageAIClient({ apiKey });
  return _client;
}

export async function embedTexts(
  texts: string[],
  inputType: 'document' | 'query' = 'document',
): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const res = await voyage().embed({
      input: batch,
      model: MODEL,
      inputType,
      outputDimension: EMBEDDING_DIM,
    });
    const vectors = res.data?.map((d) => d.embedding ?? []) ?? [];
    for (const v of vectors) {
      if (v.length !== EMBEDDING_DIM) {
        throw new Error(`Embedding dim mismatch: got ${v.length}, expected ${EMBEDDING_DIM}`);
      }
      out.push(v);
    }
  }
  return out;
}

export async function embedQuery(text: string): Promise<number[]> {
  const [vec] = await embedTexts([text], 'query');
  if (!vec) throw new Error('embedQuery returned no vector');
  return vec;
}
