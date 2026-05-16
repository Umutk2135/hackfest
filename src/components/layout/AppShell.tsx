/**
 * OWNER: P1 (Frontend)
 */
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RoleSwitcher } from './RoleSwitcher';
import { PodiumMark } from './PodiumMark';
import { useRole } from '@/hooks/useRole';
import { t } from '@/lib/i18n';
import { isMockApi } from '@/lib/api';

export function AppShell({ children }: { children: ReactNode }) {
  const { role } = useRole();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 text-foreground shrink-0">
            <PodiumMark className="h-6 w-6 text-[hsl(var(--seminar))]" />
            <span className="font-display text-xl font-medium tracking-tight">{t('app.name')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <RoleSwitcher
              value={role}
              onChange={(r) => {
                navigate(r === 'teacher' ? '/teacher' : '/student');
              }}
            />
          </div>
        </div>
      </header>

      {isMockApi ? (
        <div role="status" className="kursu-mock-banner text-center py-2 text-xs font-medium">
          {t('app.mock.banner')}
        </div>
      ) : null}

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {children}
      </main>

      <footer className="kursu-footer py-8 mt-auto">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 text-[hsl(var(--on-dark))]">
            <PodiumMark className="h-4 w-4" />
            <span className="font-display text-sm font-medium">Kürsü</span>
          </div>
          <p className="text-xs">HSIL Hackathon 2026</p>
        </div>
      </footer>
    </div>
  );
}
