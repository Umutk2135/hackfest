/**
 * OWNER: P1 (Frontend)
 * Clickable inline citation chip. Click → toast (Phase 3 swaps for modal w/ full snippet).
 */
import { toast } from 'sonner';
import type { Citation } from '@shared/types';
import { cn } from '@/lib/cn';

export function CitationBadge({ citation }: { citation: Citation }) {
  const label = citation.source_type === 'note' ? `Not: ${citation.reference}` : `Ders: ${citation.reference}`;
  return (
    <button
      onClick={() => toast(`${label} — ${citation.snippet}`)}
      className={cn(
        'text-[10px] px-1.5 py-0.5 rounded border border-current opacity-80 hover:opacity-100 transition-opacity',
      )}
      title={citation.snippet}
    >
      [{label}]
    </button>
  );
}
