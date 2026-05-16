/**
 * OWNER: P1 (Frontend) — citation-badge-note / citation-badge-transcript
 */
import { toast } from 'sonner';
import type { Citation } from '@shared/types';
import { cn } from '@/lib/cn';

export function CitationBadge({ citation }: { citation: Citation }) {
  const isNote = citation.source_type === 'note';
  const label = isNote ? `Not: ${citation.reference}` : `Ders: ${citation.reference}`;
  return (
    <button
      type="button"
      onClick={() => toast(`${label} — ${citation.snippet}`)}
      className={cn(
        'text-xs font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isNote && 'bg-[#ede9f4] text-[hsl(var(--citation-note))]',
        !isNote && 'bg-[#e4f0e8] text-[hsl(var(--citation-transcript))]',
      )}
      title={citation.snippet}
    >
      [{label}]
    </button>
  );
}
