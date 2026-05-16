/**
 * OWNER: P1 (Frontend)
 * "/teacher/lectures/new"
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

export function TeacherNewLecture() {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.createLecture({ title, subject, description });
      toast.success('Ders oluşturuldu.');
      nav(`/teacher/lectures/${res.id}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>{t('teacher.new.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium">{t('teacher.new.field.title')}</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-medium">{t('teacher.new.field.subject')}</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-medium">{t('teacher.new.field.description')}</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? '...' : t('teacher.new.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
