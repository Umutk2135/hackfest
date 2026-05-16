/**
 * OWNER: P1 (Frontend)
 * Tag-cloud-ish view of the report's top_confusion_points.
 */
import type { FeedbackReport } from '@shared/types';

export function ConfusionPointsCloud({ items }: { items: FeedbackReport['topConfusionPoints'] }) {
  if (!items?.length) return <p className="text-sm text-[hsl(var(--muted-foreground))]">Yok.</p>;
  const max = Math.max(...items.map((i) => i.question_count));
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it, i) => {
        const scale = 0.8 + 0.6 * (it.question_count / Math.max(1, max));
        return (
          <span
            key={i}
            title={it.sample_quote}
            className="rounded-full bg-[hsl(var(--secondary))] px-3 py-1 text-[hsl(var(--secondary-foreground))]"
            style={{ fontSize: `${scale}rem` }}
          >
            {it.theme} <span className="text-[hsl(var(--muted-foreground))] text-xs">×{it.question_count}</span>
          </span>
        );
      })}
    </div>
  );
}
