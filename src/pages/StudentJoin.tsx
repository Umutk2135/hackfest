/**
 * OWNER: P1 (Frontend)
 * "/student" — enter code + name.
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

export function StudentJoin() {
  const nav = useNavigate();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    window.localStorage.setItem('kursu:studentName', name.trim());
    toast.success(`${name.trim()}, hoş geldiniz.`);
    nav(`/student/lectures/${code.trim().toUpperCase()}`);
  }

  return (
    <Card className="max-w-md mx-auto w-full">
      <CardHeader>
        <CardTitle>{t('student.join.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium">{t('student.join.code')}</label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="KRSU-DEMO"
              required
              autoCapitalize="characters"
              className="text-base min-h-11"
            />
          </div>
          <div>
            <label className="text-xs font-medium">{t('student.join.name')}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="text-base min-h-11"
            />
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('student.consent')}</p>
          <Button type="submit" className="w-full min-h-11 text-base">
            {t('student.join.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
