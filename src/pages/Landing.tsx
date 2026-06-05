/**
 * OWNER: P1 (Frontend)
 */
import { Link } from 'react-router-dom';
import { GraduationCap, UserRound, Radio, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { t } from '@/lib/i18n';

const FEATURES = [
  {
    key: 'landing.feature.live' as const,
    body: 'Mikrofonu açın; transkript ve sorular akmaya başlasın.',
    icon: Radio,
  },
  {
    key: 'landing.feature.feedback' as const,
    body: 'Ders sonunda anlaşılırlık, tempo ve etkileşim raporu.',
    icon: BarChart3,
  },
  {
    key: 'landing.feature.post' as const,
    body: 'Ders bittikten sonra da sorular cevaplanmaya devam eder.',
    icon: FileText,
  },
] as const;

export function Landing() {
  return (
    <div className="space-y-16">
      <section className="text-center py-10 sm:py-16 max-w-3xl mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--seminar))] mb-4">
          Canlı ders · Türkçe
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-[3.5rem] leading-[1.08] text-foreground">
          {t('app.name')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{t('app.tagline')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" variant="teacher" className="inline-flex">
            <Link to="/teacher" className="inline-flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              {t('landing.cta.teacher')}
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="inline-flex">
            <Link to="/student" className="inline-flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              {t('landing.cta.student')}
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        {FEATURES.map(({ key, body, icon: Icon }) => (
          <Card key={key} className="kursu-feature-card">
            <CardContent className="pt-6">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--surface-soft))] flex items-center justify-center text-[hsl(var(--seminar))] mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-medium">{t(key)}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
