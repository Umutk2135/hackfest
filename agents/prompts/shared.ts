/**
 * OWNER: P3 (AI)
 * Shared XML helpers + citation format spec used across agent prompts.
 */

export const CITATION_FORMAT = `
- [Not: sayfa N]   — for note chunks (use the chunk's page_reference, e.g. "sayfa 2")
- [Ders: MM:SS]    — for transcript segments (use MM:SS of segment.start_time_seconds)

If multiple sources support a claim, cite all of them inline like [Not: sayfa 2][Ders: 03:42].
`.trim();

/** Wrap text in an XML tag — improves Claude's reliability on structured inputs. */
export function xml(tag: string, text: string, attrs: Record<string, string> = {}): string {
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
    .join('');
  return `<${tag}${attrStr}>${text}</${tag}>`;
}

function escapeAttr(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export function mmss(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
