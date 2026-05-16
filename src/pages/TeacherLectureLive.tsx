/**
 * OWNER: P1 (Frontend)
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionCodeDisplay } from '@/components/lecture/SessionCodeDisplay';
import { LiveTranscriptStream } from '@/components/live/LiveTranscriptStream';
import { TeacherQuestionPanel } from '@/components/live/TeacherQuestionPanel';
import { MicPermissionGate } from '@/components/live/MicPermissionGate';
import { useTranscriptStream } from '@/hooks/useTranscriptStream';
import { useLecture } from '@/hooks/useLecture';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

export function TeacherLectureLive() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data } = useLecture(id);
  const [enabled, setEnabled] = useState(false);
  const stream = useTranscriptStream({ lectureId: id ?? '', enabled });
  const [busy, setBusy] = useState(false);

  if (!data) return null;
  const { lecture } = data;

  async function end() {
    if (!id) return;
    setBusy(true);
    try {
      await api.endSession(id);
      stream.stop();
      toast.success('Oturum sonlandı, geri bildirim oluşturuluyor.');
      nav(`/teacher/lectures/${id}/feedback`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="live">Canlı</Badge>
          </div>
          <h1 className="font-display text-2xl font-medium">{lecture.title}</h1>
          <p className="text-sm text-muted-foreground">{lecture.subject}</p>
        </div>
        <Button
          variant="outline"
          onClick={end}
          disabled={busy}
          className="border-destructive text-destructive hover:bg-destructive/10"
        >
          {t('live.end')}
        </Button>
      </div>

      <SessionCodeDisplay code={lecture.sessionCode} />

      {!enabled ? (
        <MicPermissionGate
          status={stream.status === 'listening' ? 'idle' : stream.status}
          error={stream.error}
          onStart={() => setEnabled(true)}
        />
      ) : null}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <LiveTranscriptStream
            lectureId={lecture.id}
            source="mic"
            interim={stream.interim}
            localSegments={stream.localSegments}
          />
        </div>
        <div className="rounded-lg border border-border bg-[hsl(var(--surface-soft))] p-4">
          <TeacherQuestionPanel lectureId={lecture.id} />
        </div>
      </div>
    </div>
  );
}
