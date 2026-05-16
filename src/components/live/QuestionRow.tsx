/**
 * OWNER: P1 (Frontend)
 * One row in the teacher question panel.
 */
import { useState } from 'react';
import { Check, Flag, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { Question, QuestionStatus } from '@shared/types';

const STATUS: Record<QuestionStatus, { label: string; variant: 'success' | 'warning' | 'secondary' | 'outline' }> = {
  pending: { label: 'Bekliyor', variant: 'secondary' },
  answered_by_ai: { label: 'AI cevapladı', variant: 'success' },
  flagged_for_teacher: { label: 'Öğretmene iletildi', variant: 'warning' },
  answered_by_teacher: { label: 'Öğretmen cevapladı', variant: 'outline' },
};

export function QuestionRow({ question }: { question: Question }) {
  const [open, setOpen] = useState(false);
  const [resp, setResp] = useState('');
  const [busy, setBusy] = useState(false);
  const info = STATUS[question.status];

  async function send() {
    if (!resp.trim()) return;
    setBusy(true);
    try {
      await api.teacherRespond(question.id, { teacherResponse: resp });
      toast.success('Cevabınız gönderildi.');
      setOpen(false);
      setResp('');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-lg border border-[hsl(var(--border))] p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium flex-1">{question.questionText}</p>
        <Badge variant={info.variant}>
          {question.status === 'flagged_for_teacher' && <Flag className="h-3 w-3 mr-1" />}
          {question.status === 'answered_by_ai' && <Check className="h-3 w-3 mr-1" />}
          {info.label}
        </Badge>
      </div>
      {question.aiAnswer && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{question.aiAnswer}</p>
      )}
      {question.status === 'flagged_for_teacher' && (
        <>
          {!open && (
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              <MessageSquare className="h-3 w-3" />
              Cevapla
            </Button>
          )}
          {open && (
            <div className="space-y-2">
              <Textarea
                value={resp}
                onChange={(e) => setResp(e.target.value)}
                rows={3}
                placeholder="Öğrenciye yanıtınız..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={send} disabled={busy}>
                  Gönder
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                  İptal
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </li>
  );
}
