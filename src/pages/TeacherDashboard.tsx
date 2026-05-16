/**
 * OWNER: P1 (Frontend)
 * "/teacher" — list of lectures + create button.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LectureCard } from '@/components/lecture/LectureCard';
import { EmptyState } from '@/components/layout/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import type { Lecture } from '@shared/types';

export function TeacherDashboard() {
  const [lectures, setLectures] = useState<Lecture[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listLectures()
      .then((r) => setLectures(r.lectures))
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('teacher.dashboard.title')}</h1>
        <Button asChild={false}>
          <Link to="/teacher/lectures/new" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('teacher.dashboard.new')}
          </Link>
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {lectures === null && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}
      {lectures && lectures.length === 0 && (
        <EmptyState
          title={t('teacher.dashboard.empty')}
          description="Yeni ders oluştur ve notlarınızı yükleyin."
          action={
            <Button asChild={false}>
              <Link to="/teacher/lectures/new">{t('teacher.dashboard.new')}</Link>
            </Button>
          }
        />
      )}
      {lectures && lectures.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lectures.map((l) => (
            <LectureCard key={l.id} lecture={l} />
          ))}
        </div>
      )}
    </div>
  );
}
