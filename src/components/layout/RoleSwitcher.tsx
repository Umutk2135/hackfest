/**
 * OWNER: P1 (Frontend) — role-switcher-pill per DESIGN.md
 */
import { useRole, type Role } from '@/hooks/useRole';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/cn';

interface Props {
  value?: Role;
  onChange?: (r: Role) => void;
}

export function RoleSwitcher({ value, onChange }: Props) {
  const ctx = useRole();
  const current = value ?? ctx.role;
  const set = (r: Role) => {
    ctx.setRole(r);
    onChange?.(r);
  };
  return (
    <div className="inline-flex rounded-full border border-border bg-[hsl(var(--surface-soft))] p-1 text-xs font-medium">
      <button
        type="button"
        className={cn(
          'px-3.5 py-1.5 rounded-full transition-colors',
          current === 'teacher' && 'bg-[hsl(var(--seminar))] text-white shadow-sm',
          current !== 'teacher' && 'text-muted-foreground hover:text-foreground',
        )}
        onClick={() => set('teacher')}
      >
        {t('app.role.teacher')}
      </button>
      <button
        type="button"
        className={cn(
          'px-3.5 py-1.5 rounded-full transition-colors',
          current === 'student' && 'bg-[hsl(var(--seminar))] text-white shadow-sm',
          current !== 'student' && 'text-muted-foreground hover:text-foreground',
        )}
        onClick={() => set('student')}
      >
        {t('app.role.student')}
      </button>
    </div>
  );
}
