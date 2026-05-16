/**
 * OWNER: P1 (Frontend)
 * Header + main content wrapper. Includes role switcher + theme toggle.
 */
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RoleSwitcher } from './RoleSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { useRole } from '@/hooks/useRole';
import { t } from '@/lib/i18n';

export function AppShell({ children }: { children: ReactNode }) {
  const { role } = useRole();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-block h-5 w-5 rounded bg-[hsl(var(--primary))]" />
            <span>{t('app.name')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <RoleSwitcher
              value={role}
              onChange={(r) => {
                navigate(r === 'teacher' ? '/teacher' : '/student');
              }}
            />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">{children}</main>

      <footer className="border-t border-[hsl(var(--border))] py-4">
        <div className="mx-auto max-w-6xl px-4 text-xs text-[hsl(var(--muted-foreground))]">
          Kürsü · HSIL Hackathon 2026
        </div>
      </footer>
    </div>
  );
}
