/**
 * OWNER: P3 (AI)
 * Recursive character splitter for lecture notes + transcript.
 * ~500 chars per chunk with 80 char overlap. Splits on paragraph → sentence → word boundaries.
 */

const TARGET_CHARS = 500;
const OVERLAP_CHARS = 80;
const SEPARATORS = ['\n\n', '\n', '. ', '? ', '! ', ' '];

export interface Chunk {
  index: number;
  content: string;
  /** Optional human-readable source (e.g. "page 2", "section 3.1"). */
  pageReference?: string;
}

export function chunkText(text: string, targetChars = TARGET_CHARS): Chunk[] {
  const cleaned = text.replace(/\r\n/g, '\n').trim();
  if (!cleaned) return [];

  const pieces = recursiveSplit(cleaned, targetChars);
  const merged = mergeSmall(pieces, targetChars);
  return merged.map((content, index) => ({ index, content }));
}

function recursiveSplit(text: string, target: number, sepIdx = 0): string[] {
  if (text.length <= target) return [text];
  const sep = SEPARATORS[sepIdx];
  if (!sep) {
    // Hard cut by character.
    const out: string[] = [];
    for (let i = 0; i < text.length; i += target) {
      out.push(text.slice(i, i + target));
    }
    return out;
  }
  const parts = text.split(sep);
  const out: string[] = [];
  for (const part of parts) {
    if (part.length > target) {
      out.push(...recursiveSplit(part, target, sepIdx + 1));
    } else {
      out.push(part);
    }
  }
  return out;
}

function mergeSmall(parts: string[], target: number): string[] {
  const out: string[] = [];
  let buf = '';
  for (const p of parts) {
    if (!p) continue;
    if ((buf + ' ' + p).length <= target) {
      buf = buf ? `${buf} ${p}` : p;
    } else {
      if (buf) out.push(buf);
      // Carry overlap from the tail of the previous chunk to preserve context.
      const tail = buf.slice(-OVERLAP_CHARS);
      buf = tail ? `${tail} ${p}` : p;
    }
  }
  if (buf) out.push(buf);
  return out;
}

/**
 * Simple page heuristic: if the text contains a form-feed (\f) per page, split there.
 * pdf-parse emits \f between pages.
 */
export function chunkPdfText(text: string, targetChars = TARGET_CHARS): Chunk[] {
  if (!text.includes('\f')) return chunkText(text, targetChars);
  const pages = text.split('\f');
  const out: Chunk[] = [];
  let idx = 0;
  pages.forEach((pageText, pageIdx) => {
    const pageChunks = chunkText(pageText, targetChars);
    for (const c of pageChunks) {
      out.push({ index: idx++, content: c.content, pageReference: `sayfa ${pageIdx + 1}` });
    }
  });
  return out;
}
