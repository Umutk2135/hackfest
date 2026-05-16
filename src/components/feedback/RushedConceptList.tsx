/**
 * OWNER: P1 (Frontend)
 */
import { Clock } from 'lucide-react';
import type { FeedbackReport } from '@shared/types';

export function RushedConceptList({ items }: { items: FeedbackReport['rushedConcepts'] }) {
  if (!items?.length) return <p className="text-sm text-[hsl(var(--muted-foreground))]">Yok.</p>;
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <Clock className="h-4 w-4 mt-0.5 text-amber-400" />
          <div>
            <p className="font-medium">{it.concept}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {it.timestamp} · {it.reason}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
