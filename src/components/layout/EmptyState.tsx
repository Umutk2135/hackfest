/**
 * OWNER: P1 (Frontend)
 * Reusable empty state with optional CTA.
 */
import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl border border-dashed border-border bg-[hsl(var(--surface-soft))]/50">
      {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
      <h3 className="font-display text-lg font-medium">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-md">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
