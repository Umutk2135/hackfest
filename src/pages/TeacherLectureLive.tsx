/**
 * OWNER: P1 (Frontend)
 * "/teacher/lectures/:id/live" — live session view.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SessionCodeDisplay } from '@/components/lecture/SessionCodeDisplay';
import { LiveTranscriptStream } from '@/components/live/LiveTranscriptStream';
import { TeacherQuestionPanel } from '@/components/live/TeacherQuestionPanel';
import { MicPermissionGate } from '@/components/live/MicPermissionGate';
import { useTranscriptStream } from '@/hooks/useTranscriptStream';
import { useLecture } from '@/hooks/useLecture';
import { api } from '@/lib/api';
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{lecture.title}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{lecture.subject}</p>
        </div>
        <Button variant="destructive" onClick={end} disabled={busy}>
          Oturumu sonlandır
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
        <div>
          <TeacherQuestionPanel lectureId={lecture.id} />
        </div>
      </div>
    </div>
  );
}
