/**
 * OWNER: P1 (Frontend)
 * "/" — hero + role CTAs.
 */
import { Link } from 'react-router-dom';
import { GraduationCap, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { t } from '@/lib/i18n';

export function Landing() {
  return (
    <div className="space-y-10">
      <section className="text-center py-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{t('app.name')}</h1>
        <p className="mt-3 text-lg text-[hsl(var(--muted-foreground))]">{t('app.tagline')}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild={false} size="lg">
            <Link to="/teacher" className="inline-flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              {t('landing.cta.teacher')}
            </Link>
          </Button>
          <Button asChild={false} variant="outline" size="lg">
            <Link to="/student" className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              {t('landing.cta.student')}
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        {(
          [
            ['landing.feature.live', 'Mikrofonu açın; transkript ve sorular akmaya başlasın.'],
            ['landing.feature.feedback', 'Ders sonunda anlaşılırlık, tempo ve etkileşim raporu.'],
            ['landing.feature.post', 'Ders bittikten sonra da sorular cevaplanmaya devam eder.'],
          ] as const
        ).map(([key, body]) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{t(key)}</h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
