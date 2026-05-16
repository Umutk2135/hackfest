/**
 * OWNER: P1 (Frontend)
 * Teacher/Student segmented control.
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
    <div className="inline-flex rounded-md border border-[hsl(var(--border))] p-0.5 text-xs">
      <button
        className={cn(
          'px-3 py-1.5 rounded-sm transition-colors',
          current === 'teacher' && 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
        )}
        onClick={() => set('teacher')}
      >
        {t('app.role.teacher')}
      </button>
      <button
        className={cn(
          'px-3 py-1.5 rounded-sm transition-colors',
          current === 'student' && 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
        )}
        onClick={() => set('student')}
      >
        {t('app.role.student')}
      </button>
    </div>
  );
}
