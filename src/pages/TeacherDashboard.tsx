/**
 * OWNER: P1 (Frontend)
 * "/teacher" — list of lectures + create button.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LectureCard } from '@/components/lecture/LectureCard';
import { EmptyState } from '@/components/layout/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeacherProfile } from '@/hooks/useTeacherProfile';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';
import type { Lecture } from '@shared/types';

export function TeacherDashboard() {
  const [lectures, setLectures] = useState<Lecture[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState('');
  const [registering, setRegistering] = useState(false);
  const { profile, createLocalProfile, saveProfile, clearProfile } = useTeacherProfile();

  useEffect(() => {
    if (!profile) return;
    setLectures(null);
    setError(null);
    api
      .listLectures()
      .then((r) => setLectures(r.lectures))
      .catch((e) => setError((e as Error).message));
  }, [profile]);

  async function registerTeacher(e: FormEvent) {
    e.preventDefault();
    const name = teacherName.trim();
    if (!name || registering) return;
    setRegistering(true);
    const local = createLocalProfile(name);
    try {
      const res = await api.registerTeacher(local);
      saveProfile({ id: res.teacher.id, name: res.teacher.name });
      toast.success('Öğretmen kaydı oluşturuldu.');
    } catch (err) {
      clearProfile();
      toast.error((err as Error).message);
    } finally {
      setRegistering(false);
    }
  }

  if (!profile) {
    return (
      <Card className="max-w-xl mx-auto kursu-feature-card">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Öğretmen kaydı</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={registerTeacher} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Ad soyad
              </label>
              <Input
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Örn. Ayşe Yılmaz"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Her öğretmenin dersleri ayrı tutulur. Bu demo kaydı bu tarayıcıda saklanır ve DB'ye yazılır.
            </p>
            <Button type="submit" disabled={!teacherName.trim() || registering}>
              {registering ? 'Kaydediliyor...' : 'Kaydol ve devam et'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium">{t('teacher.dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">Öğretmen: {profile.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={clearProfile}>
            <LogOut className="h-4 w-4" />
            Öğretmen değiştir
          </Button>
          <Button variant="default" className="inline-flex">
            <Link to="/teacher/lectures/new" className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('teacher.dashboard.new')}
            </Link>
          </Button>
        </div>
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
            <Button className="inline-flex">
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
