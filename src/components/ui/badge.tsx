/**
 * OWNER: P1 (Frontend) — Kürsü badges
 */
import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
  {
    variants: {
      variant: {
        default: 'bg-[hsl(var(--surface-card))] text-foreground',
        secondary: 'bg-[hsl(var(--surface-soft))] text-muted-foreground',
        outline: 'border border-border text-foreground',
        live: 'bg-[hsl(var(--live))] text-white',
        draft: 'bg-[hsl(var(--surface-cream-strong))] text-muted-foreground',
        success: 'bg-[hsl(var(--live-muted))] text-[hsl(var(--live))]',
        warning: 'bg-amber-100 text-amber-800 border border-amber-200',
        destructive: 'bg-red-100 text-red-800 border border-red-200',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
