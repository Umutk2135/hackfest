/**
 * OWNER: P1 (Frontend) — Kürsü button variants per DESIGN.md
 */
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 min-h-[44px]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-[hsl(22_44%_48%)]',
        teacher: 'bg-[hsl(var(--seminar))] text-[hsl(var(--seminar-foreground))] hover:bg-[hsl(213_35%_32%)]',
        secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-[hsl(var(--surface-cream-strong))]',
        outline:
          'border border-border bg-background text-foreground hover:bg-[hsl(var(--surface-soft))]',
        ghost: 'hover:bg-[hsl(var(--surface-soft))] text-foreground',
        destructive:
          'bg-destructive text-destructive-foreground hover:opacity-90',
        live: 'bg-[hsl(var(--live))] text-white hover:opacity-90',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 min-h-9 rounded-md px-3 text-xs',
        lg: 'h-12 min-h-12 rounded-md px-7 text-base',
        icon: 'h-11 w-11 min-h-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, ...props },
  ref,
) {
  return (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
});

export { buttonVariants };
